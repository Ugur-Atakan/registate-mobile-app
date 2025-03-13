import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import instance from "../../http/instance"; // HTTP instance reuse

// Helper functions from the original code
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
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d önce`;
  }
  return `${hours}h önce`;
};

const TicketsScreen = ({ navigation }:any) => {
  const [tickets, setTickets] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await instance.get("/admin/support/tickets");
        setTickets(res.data);
      } catch (error) {
        console.error("Error fetching tickets:", error.response.data);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets
    .filter(ticket => 
      selectedStatus === 'ALL' || ticket.status === selectedStatus
    )
    .filter(ticket =>
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  const renderTicketItem = ({ item }) => {
    const statusStyle = getStatusColor(item.status);
    const priorityStyle = getPriorityColor(item.priority);

    return (
      <TouchableOpacity 
        style={styles.ticketItem}
        onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id })}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>
              {item.company && item.company[0] ? `${item.company[0].companyName}/` : ''}
              {item.user.firstName}
            </Text>
            <Text style={styles.ticketId}>#{item.ticketNo}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
        
        <Text style={styles.subjectText}>{item.subject}</Text>
        
        <View style={styles.ticketFooter}>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={[styles.badgeText, { color: statusStyle.textColor }]}>
                {item.status.charAt(0) + item.status.slice(1).toLowerCase().replace('_', ' ')}
              </Text>
            </View>
            
            <View style={[styles.badge, { backgroundColor: priorityStyle.backgroundColor }]}>
              <Text style={[styles.badgeText, { color: priorityStyle.textColor }]}>
                {item.priority.charAt(0) + item.priority.slice(1).toLowerCase()}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id })}
          >
            <Feather name="eye" size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Destek Talepleri</Text>
          <Text style={styles.headerSubtitle}>Müşteri destek taleplerini yönetin</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bell" size={20} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton}>
            <Text style={styles.avatarText}>A</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <TouchableOpacity 
          style={styles.filterToggle}
          onPress={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
        >
          <Text style={styles.filterToggleText}>Filtreler</Text>
          <Feather name={isFilterMenuOpen ? "chevron-up" : "chevron-down"} size={16} color="#4B5563" />
        </TouchableOpacity>
        
        {isFilterMenuOpen && (
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusFilterScroll}
            contentContainerStyle={styles.statusFilterContent}
          >
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusFilterButton,
                  selectedStatus === status && styles.selectedStatusButton
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text 
                  style={[
                    styles.statusFilterText,
                    selectedStatus === status && styles.selectedStatusText
                  ]}
                >
                  {status === 'ALL' ? 'Tüm Talepler' : 
                   status === 'OPEN' ? 'Açık' : 
                   status === 'IN_PROGRESS' ? 'İşlemde' : 'Çözüldü'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Taleplerde ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sıralama:</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity 
              style={[
                styles.sortOption,
                sortBy === 'latest' && styles.selectedSortOption
              ]}
              onPress={() => setSortBy('latest')}
            >
              <Text style={sortBy === 'latest' ? styles.selectedSortText : styles.sortText}>En Yeni</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sortOption,
                sortBy === 'oldest' && styles.selectedSortOption
              ]}
              onPress={() => setSortBy('oldest')}
            >
              <Text style={sortBy === 'oldest' ? styles.selectedSortText : styles.sortText}>En Eski</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sortOption,
                sortBy === 'priority' && styles.selectedSortOption
              ]}
              onPress={() => setSortBy('priority')}
            >
              <Text style={sortBy === 'priority' ? styles.selectedSortText : styles.sortText}>Öncelik</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <FlatList
        data={filteredTickets}
        renderItem={renderTicketItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.ticketList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={50} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>Hiç talep bulunamadı</Text>
          </View>
        }
      />
      
      <View style={styles.pagination}>
        <Text style={styles.paginationInfo}>
          {filteredTickets.length} / {tickets.length} talep gösteriliyor
        </Text>
        <View style={styles.paginationControls}>
          <TouchableOpacity style={styles.paginationButton}>
            <Text style={styles.paginationButtonText}>Önceki</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.paginationButton, styles.activePaginationButton]}>
            <Text style={styles.activePaginationButtonText}>1</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.paginationButton}>
            <Text style={styles.paginationButtonText}>2</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.paginationButton}>
            <Text style={styles.paginationButtonText}>Sonraki</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1649FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  filterSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
  },
  filterToggleText: {
    color: '#4B5563',
    fontSize: 16,
  },
  statusFilterScroll: {
    marginBottom: 16,
  },
  statusFilterContent: {
    paddingRight: 8,
  },
  statusFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  selectedStatusButton: {
    backgroundColor: '#1649FF',
    borderColor: '#1649FF',
  },
  statusFilterText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedStatusText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginRight: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sortOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedSortOption: {
    backgroundColor: '#EEF2FF',
  },
  sortText: {
    color: '#4B5563',
    fontSize: 14,
  },
  selectedSortText: {
    color: '#1649FF',
    fontWeight: '500',
    fontSize: 14,
  },
  ticketList: {
    padding: 16,
  },
  ticketItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  ticketId: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  subjectText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  pagination: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paginationButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activePaginationButton: {
    backgroundColor: '#1649FF',
    borderColor: '#1649FF',
  },
  paginationButtonText: {
    color: '#4B5563',
    fontSize: 14,
  },
  activePaginationButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default TicketsScreen;