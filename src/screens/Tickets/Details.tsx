import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import instance from "../../http/instance"; // HTTP instance reuse

const getStatusColor = (status:string) => {
  switch (status) {
    case 'OPEN':
      return { backgroundColor: '#EEF2FF', textColor: '#1649FF' };
    case 'IN_PROGRESS':
      return { backgroundColor: '#E8FFF3', textColor: '#9EE248' };
    case 'RESOLVED':
      return { backgroundColor: '#F3F4F6', textColor: '#6B7280' };
    default:
      return { backgroundColor: '#F3F4F6', textColor: '#6B7280' };
  }
};

const getPriorityColor = (priority:string) => {
  switch (priority) {
    case 'HIGH':
      return { backgroundColor: '#FEE2E2', textColor: '#DC2626' };
    case 'MEDIUM':
      return { backgroundColor: '#EEF2FF', textColor: '#1649FF' };
    case 'LOW':
      return { backgroundColor: '#E8FFF3', textColor: '#9EE248' };
    default:
      return { backgroundColor: '#F3F4F6', textColor: '#6B7280' };
  }
};

const formatDate = (dateString:string) => {
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TicketDetailsScreen = ({ route, navigation }:any) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setLoading(true);
        const res = await instance.get(`/admin/ticket/${ticketId}/details`);
        setTicket(res.data);
      } catch (error) {
        console.error("Error fetching ticket details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicketDetails();
  }, [ticketId]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      await instance.post(`/admin/support/tickets/${ticketId}/reply`, {
        message: replyText
      });
      
      // Refresh ticket data to get the new reply
      const res = await instance.get(`/admin/support/tickets/${ticketId}`);
      setTicket(res.data);
      setReplyText('');
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1649FF" />
        <Text style={styles.loadingText}>Talep detayları yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Feather name="alert-circle" size={50} color="#EF4444" />
        <Text style={styles.errorText}>Talep detayları yüklenemedi</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(ticket.status);
  const priorityStyle = getPriorityColor(ticket.priority);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color="#4B5563" />
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Talep #{ticket.ticketNo}</Text>
          <View style={styles.placeholderView} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.ticketInfo}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketSubject}>{ticket.subject}</Text>
              <View style={styles.statusBadges}>
                <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Text style={[styles.badgeText, { color: statusStyle.textColor }]}>
                    {ticket.status === 'OPEN' ? 'Açık' : 
                     ticket.status === 'IN_PROGRESS' ? 'İşlemde' : 'Çözüldü'}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: priorityStyle.backgroundColor }]}>
                  <Text style={[styles.badgeText, { color: priorityStyle.textColor }]}>
                    {ticket.priority === 'HIGH' ? 'Yüksek' :
                     ticket.priority === 'MEDIUM' ? 'Orta' : 'Düşük'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.customerInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Müşteri:</Text>
                <Text style={styles.infoValue}>
                  {ticket.user.firstName} {ticket.user.lastName}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Şirket:</Text>
                <Text style={styles.infoValue}>
                  {ticket.company && ticket.company[0] 
                    ? ticket.company[0].companyName 
                    : 'Belirtilmemiş'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Oluşturulma:</Text>
                <Text style={styles.infoValue}>{formatDate(ticket.createdAt)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.messagesContainer}>
            <Text style={styles.sectionTitle}>Yazışmalar</Text>
            
            {/* Initial message */}
            <View style={styles.messageItem}>
              <View style={styles.messageSender}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {ticket.user.firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.senderName}>
                    {ticket.user.firstName} {ticket.user.lastName}
                  </Text>
                  <Text style={styles.messageTime}>{formatDate(ticket.createdAt)}</Text>
                </View>
              </View>
              <View style={styles.messageContent}>
                <Text style={styles.messageText}>{ticket.description}</Text>
              </View>
            </View>
            
            {/* Replies */}
            {ticket.replies && ticket.replies.map((reply) => (
              <View key={reply.id} style={styles.messageItem}>
                <View style={styles.messageSender}>
                  <View style={[styles.avatar, reply.isAdmin ? styles.adminAvatar : {}]}>
                    <Text style={styles.avatarText}>
                      {reply.sender.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.senderName}>
                      {reply.sender} {reply.isAdmin ? '(Admin)' : ''}
                    </Text>
                    <Text style={styles.messageTime}>{formatDate(reply.createdAt)}</Text>
                  </View>
                </View>
                <View style={styles.messageContent}>
                  <Text style={styles.messageText}>{reply.message}</Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* Extra space at the bottom to ensure all content is visible above the reply box */}
          <View style={{height: 100}} />
        </ScrollView>

        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Yanıtınızı yazın..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !replyText.trim() && styles.disabledButton]}
            onPress={handleSendReply}
            disabled={!replyText.trim()}
          >
            <Feather name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4B5563',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholderView: {
    width: 60, // Balance the layout with back button
  },
  content: {
    flex: 1,
  },
  ticketInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  ticketHeader: {
    marginBottom: 16,
  },
  ticketSubject: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  statusBadges: {
    flexDirection: 'row',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  customerInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  messagesContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  messageItem: {
    marginBottom: 24,
  },
  messageSender: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adminAvatar: {
    backgroundColor: '#1649FF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  messageContent: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginLeft: 48,
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  replyContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#1649FF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});

export default TicketDetailsScreen;