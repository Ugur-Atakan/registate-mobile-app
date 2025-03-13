import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import instance from "../../http/instance"; // HTTP instance reuse

const getStatusColor = (status) => {
  switch (status) {
    case 'OPEN':
      return { backgroundColor: '#FEF9C3', textColor: '#CA8A04' };
    case 'IN_PROGRESS':
      return { backgroundColor: '#EEF2FF', textColor: '#1649FF' };
    case 'COMPLETED':
      return { backgroundColor: '#E8FFF3', textColor: '#22C55E' };
    default:
      return { backgroundColor: '#F3F4F6', textColor: '#6B7280' };
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'HIGH':
      return { backgroundColor: '#FEE2E2', textColor: '#DC2626' };
    case 'MEDIUM':
      return { backgroundColor: '#EEF2FF', textColor: '#1649FF' };
    case 'LOW':
      return { backgroundColor: '#E8FFF3', textColor: '#22C55E' };
    default:
      return { backgroundColor: '#F3F4F6', textColor: '#6B7280' };
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 'GENERAL':
      return { backgroundColor: '#F3E8FF', textColor: '#7E22CE' };
    case 'LEGAL':
      return { backgroundColor: '#DBEAFE', textColor: '#2563EB' };
    case 'ADMINISTRATIVE':
      return { backgroundColor: '#FFEDD5', textColor: '#C2410C' };
    default:
      return { backgroundColor: '#F3F4F6', textColor: '#6B7280' };
  }
};

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const options = {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };
  
  return date.toLocaleDateString('tr-TR', options);
};

const TaskDetailsScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const response = await instance.get(`/admin/task/${taskId}`);
        setTask(response.data);
        
        // Fetch comments if there's a comments endpoint
        try {
          const commentsResponse = await instance.get(`/admin/task/${taskId}/comments`);
          setComments(commentsResponse.data || []);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      } catch (error) {
        Alert.alert("Hata", "Görev detayları yüklenirken bir hata oluştu");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await instance.patch(`/admin/task/${taskId}/status`, { status: newStatus });
      
      // Update the task in state
      setTask(prev => ({ ...prev, status: newStatus }));
      
      Alert.alert("Başarılı", "Görev durumu güncellendi");
    } catch (error) {
      Alert.alert("Hata", "Görev durumu güncellenirken bir hata oluştu");
    }
  };

  const handleCompleteTask = async () => {
    try {
      await instance.patch(`/admin/task/${taskId}/complete`);
      
      // Update the task in state
      setTask(prev => ({ ...prev, status: 'COMPLETED' }));
      
      Alert.alert("Başarılı", "Görev tamamlandı olarak işaretlendi");
    } catch (error) {
      Alert.alert("Hata", "Görev tamamlanırken bir hata oluştu");
    }
  };

  const handleDeleteTask = async () => {
    Alert.alert(
      "Görevi Sil",
      "Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive",
          onPress: async () => {
            try {
              await instance.delete(`/admin/task/${taskId}`);
              Alert.alert("Başarılı", "Görev silindi");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Hata", "Görev silinirken bir hata oluştu");
            }
          }
        }
      ]
    );
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setCommentLoading(true);
      await instance.post(`/admin/task/${taskId}/comment`, { content: newComment });
      
      // Refresh comments
      const commentsResponse = await instance.get(`/admin/task/${taskId}/comments`);
      setComments(commentsResponse.data || []);
      
      setNewComment("");
    } catch (error) {
      Alert.alert("Hata", "Yorum eklenirken bir hata oluştu");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1649FF" />
        <Text style={styles.loadingText}>Görev detayları yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Feather name="alert-circle" size={50} color="#EF4444" />
        <Text style={styles.errorText}>Görev bulunamadı</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(task.status);
  const priorityStyle = getPriorityColor(task.priority);
  const typeStyle = task.type ? getTypeColor(task.type) : null;
  
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now && task.status !== 'COMPLETED';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Görev Detayları</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={handleDeleteTask}
            >
              <Feather name="trash-2" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleSection}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              
              <View style={styles.taskBadges}>
                <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Feather name="clock" size={14} color={statusStyle.textColor} style={styles.badgeIcon} />
                  <Text style={[styles.badgeText, { color: statusStyle.textColor }]}>
                    {task.status === 'OPEN' ? 'Açık' : 
                     task.status === 'IN_PROGRESS' ? 'İşlemde' : 'Tamamlandı'}
                  </Text>
                </View>
                
                <View style={[styles.badge, { backgroundColor: priorityStyle.backgroundColor }]}>
                  <Feather name="alert-circle" size={14} color={priorityStyle.textColor} style={styles.badgeIcon} />
                  <Text style={[styles.badgeText, { color: priorityStyle.textColor }]}>
                    {task.priority === 'HIGH' ? 'Yüksek' : 
                     task.priority === 'MEDIUM' ? 'Orta' : 'Düşük'}
                  </Text>
                </View>
                
                {typeStyle && (
                  <View style={[styles.badge, { backgroundColor: typeStyle.backgroundColor }]}>
                    <Feather name="tag" size={14} color={typeStyle.textColor} style={styles.badgeIcon} />
                    <Text style={[styles.badgeText, { color: typeStyle.textColor }]}>
                      {task.type === 'GENERAL' ? 'Genel' : 
                       task.type === 'LEGAL' ? 'Yasal' : 
                       task.type === 'ADMINISTRATIVE' ? 'İdari' : task.type}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.taskDetails}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Feather name="calendar" size={16} color="#4B5563" style={styles.detailIcon} />
                <View>
                  <Text style={styles.detailLabel}>Son Tarih</Text>
                  <Text style={[styles.detailValue, isOverdue && styles.overdueText]}>
                    {formatDate(task.dueDate)}
                    {isOverdue && " (Gecikmiş)"}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Feather name="clock" size={16} color="#4B5563" style={styles.detailIcon} />
                <View>
                  <Text style={styles.detailLabel}>Oluşturulma</Text>
                  <Text style={styles.detailValue}>{formatDate(task.createdAt)}</Text>
                </View>
              </View>
            </View>

            {task.company && (
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Feather name="briefcase" size={16} color="#4B5563" style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Şirket</Text>
                    <Text style={styles.detailValue}>{task.company}</Text>
                  </View>
                </View>
                
                {task.assignee && (
                  <View style={styles.detailItem}>
                    <Feather name="user" size={16} color="#4B5563" style={styles.detailIcon} />
                    <View>
                      <Text style={styles.detailLabel}>Atanan Kişi</Text>
                      <Text style={styles.detailValue}>{task.assignee}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.statusButton]}
                onPress={() => setStatusModalVisible(true)}
              >
                <Feather name="edit-2" size={16} color="#1649FF" />
                <Text style={styles.statusButtonText}>Durum Değiştir</Text>
              </TouchableOpacity>
              
              {task.status !== 'COMPLETED' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={handleCompleteTask}
                >
                  <Feather name="check-circle" size={16} color="#22C55E" />
                  <Text style={styles.completeButtonText}>Tamamlandı</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Comments Section */}
            <View style={styles.commentsSection}>
              <Text style={styles.sectionTitle}>Yorumlar</Text>
              
              {comments.length === 0 ? (
                <Text style={styles.noCommentsText}>Henüz yorum yok</Text>
              ) : (
                comments.map((comment, index) => (
                  <View key={comment.id || index} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAuthor}>
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarText}>
                            {comment.author ? comment.author.charAt(0).toUpperCase() : 'U'}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.authorName}>{comment.author || 'Kullanıcı'}</Text>
                          <Text style={styles.commentTime}>{formatDate(comment.createdAt, true)}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                ))
              )}
              
              <View style={styles.addCommentSection}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Yorum ekle..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.addCommentButton,
                    (!newComment.trim() || commentLoading) && styles.disabledButton
                  ]}
                  onPress={handleAddComment}
                  disabled={!newComment.trim() || commentLoading}
                >
                  {commentLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Feather name="send" size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Status Change Modal */}
        {statusModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Görev Durumunu Değiştir</Text>
                <TouchableOpacity
                  onPress={() => setStatusModalVisible(false)}
                >
                  <Feather name="x" size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                {['OPEN', 'IN_PROGRESS', 'COMPLETED'].map((status) => {
                  const isSelected = task.status === status;
                  const statusStyleColors = getStatusColor(status);
                  
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        isSelected && { backgroundColor: statusStyleColors.backgroundColor }
                      ]}
                      onPress={() => {
                        handleUpdateStatus(status);
                        setStatusModalVisible(false);
                      }}
                    >
                      <View style={styles.statusOptionContent}>
                        <View style={[
                          styles.statusIndicator,
                          { backgroundColor: statusStyleColors.textColor }
                        ]} />
                        <Text style={[
                          styles.statusOptionText,
                          isSelected && { color: statusStyleColors.textColor, fontWeight: '600' }
                        ]}>
                          {status === 'OPEN' ? 'Açık' : 
                           status === 'IN_PROGRESS' ? 'İşlemde' : 'Tamamlandı'}
                        </Text>
                      </View>
                      {isSelected && (
                        <Feather name="check" size={18} color={statusStyleColors.textColor} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setStatusModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerActionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  taskHeader: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  taskTitleSection: {
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  taskBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  taskDetails: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
  },
  overdueText: {
    color: "#DC2626",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  statusButton: {
    backgroundColor: "#EEF2FF",
    marginRight: 8,
  },
  statusButtonText: {
    marginLeft: 8,
    color: "#1649FF",
    fontWeight: "500",
  },
  completeButton: {
    backgroundColor: "#F0FDF4",
  },
  completeButtonText: {
    marginLeft: 8,
    color: "#22C55E",
    fontWeight: "500",
  },
  commentsSection: {
    marginTop: 16,
  },
  noCommentsText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 16,
  },
  commentItem: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentAuthor: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1649FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  commentTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  commentContent: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  addCommentSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  addCommentButton: {
    backgroundColor: "#1649FF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "80%",
    maxWidth: 400,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalContent: {
    paddingHorizontal: 16,
  },
  statusOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusOptionText: {
    fontSize: 16,
    color: "#4B5563",
  },
  modalCancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: "#6B7280",
  },
});

export default TaskDetailsScreen;