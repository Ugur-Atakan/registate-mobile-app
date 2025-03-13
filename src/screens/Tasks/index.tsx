import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import instance from "../../http/instance"; // HTTP instance reuse

// Helper functions from the original code
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Gecikmiş';
  } else if (diffDays === 0) {
    return 'Bugün';
  } else if (diffDays === 1) {
    return 'Yarın';
  } else {
    return `${diffDays} gün içinde`;
  }
};

const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isPriorityFilterVisible, setIsPriorityFilterVisible] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await instance.get("/admin/task/all");
      setTasks(response.data);
    } catch (error) {
      Alert.alert("Hata", "Görevler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleBulkAction = async (action) => {
    if (!selectedItems.length) return;
    
    Alert.alert(
      action === 'delete' ? "Görevleri Sil" : "Görevleri Tamamla",
      `Seçilen ${selectedItems.length} görevi ${action === 'delete' ? 'silmek' : 'tamamlamak'} istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Evet", 
          onPress: async () => {
            try {
              if (action === 'delete') {
                await Promise.all(selectedItems.map(id => 
                  instance.delete(`/admin/task/${id}`)
                ));
                Alert.alert("Başarılı", "Seçilen görevler silindi");
              } else {
                await Promise.all(selectedItems.map(id => 
                  instance.patch(`/admin/task/${id}/complete`)
                ));
                Alert.alert("Başarılı", "Görevler tamamlandı olarak işaretlendi");
              }
              fetchTasks();
              setSelectedItems([]);
            } catch (error) {
              Alert.alert("Hata", "İşlem sırasında bir hata oluştu");
            }
          }
        }
      ]
    );
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      if (selectedFilter !== 'ALL' && task.status !== selectedFilter) return false;
      if (selectedPriorities.length && !selectedPriorities.includes(task.priority)) return false;
      
      const searchTerm = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.type.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const renderTaskItem = ({ item }) => {
    const statusStyle = getStatusColor(item.status);
    const priorityStyle = getPriorityColor(item.priority);
    const isSelected = selectedItems.includes(item.id);

    return (
      <View style={[styles.taskItem, isSelected && styles.selectedTaskItem]}>
        <View style={styles.taskHeader}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => {
              setSelectedItems(prev =>
                prev.includes(item.id)
                  ? prev.filter(id => id !== item.id)
                  : [...prev, item.id]
              );
            }}
          >
            <View style={[
              styles.checkboxInner,
              isSelected && styles.checkboxChecked
            ]}>
              {isSelected && <Feather name="check" size={12} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
          
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.taskDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>
        
        <View style={styles.taskLabels}>
          <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Feather name="clock" size={12} color={statusStyle.textColor} style={styles.badgeIcon} />
            <Text style={[styles.badgeText, { color: statusStyle.textColor }]}>
              {item.status === 'OPEN' ? 'Açık' : 
               item.status === 'IN_PROGRESS' ? 'İşlemde' : 'Tamamlandı'}
            </Text>
          </View>
          
          <View style={[styles.badge, { backgroundColor: priorityStyle.backgroundColor }]}>
            <Feather name="alert-circle" size={12} color={priorityStyle.textColor} style={styles.badgeIcon} />
            <Text style={[styles.badgeText, { color: priorityStyle.textColor }]}>
              {item.priority === 'HIGH' ? 'Yüksek' : 
               item.priority === 'MEDIUM' ? 'Orta' : 'Düşük'}
            </Text>
          </View>
        </View>
        
        <View style={styles.taskFooter}>
          <View style={styles.dueDateContainer}>
            <Feather name="calendar" size={14} color="#9CA3AF" />
            <Text style={styles.dueDate}>
              {formatDate(item.dueDate)}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
            >
              <Feather name="arrow-up-right" size={18} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                Alert.alert(
                  "Görevi Sil",
                  `"${item.title}" görevini silmek istediğinizden emin misiniz?`,
                  [
                    { text: "İptal", style: "cancel" },
                    { 
                      text: "Sil", 
                      onPress: async () => {
                        try {
                          await instance.delete(`/admin/task/${item.id}`);
                          Alert.alert("Başarılı", "Görev silindi");
                          fetchTasks();
                        } catch (error) {
                          Alert.alert("Hata", "Görev silinirken bir hata oluştu");
                        }
                      },
                      style: "destructive"
                    }
                  ]
                );
              }}
            >
              <Feather name="trash-2" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const TaskOverviewCard = ({ icon, label, count, badgeText, badgeColor, badgeTextColor }) => (
    <View style={styles.overviewCard}>
      <View style={styles.overviewCardHeader}>
        <View style={styles.overviewCardIcon}>
          <Feather name={icon} size={20} color="#1649FF" />
        </View>
        <View style={[styles.overviewCardBadge, { backgroundColor: badgeColor }]}>
          <Text style={[styles.overviewCardBadgeText, { color: badgeTextColor }]}>
            {badgeText}
          </Text>
        </View>
      </View>
      <Text style={styles.overviewCardCount}>{count}</Text>
      <Text style={styles.overviewCardLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Görevler</Text>
          <Text style={styles.headerSubtitle}>Şirket görevlerini yönet ve takip et</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateTask')}
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Görev Ekle</Text>
          </TouchableOpacity>
                    
          <TouchableOpacity style={styles.avatarButton}>
            <Text style={styles.avatarText}>A</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overview Cards */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.overviewCardsContainer}
      >
        <TaskOverviewCard 
          icon="list" 
          label="Tüm Görevler" 
          count={tasks.length} 
          badgeText="Toplam" 
          badgeColor="#E8FFF3"
          badgeTextColor="#22C55E"
        />
        
        <TaskOverviewCard 
          icon="clock" 
          label="Aktif Görevler" 
          count={tasks.filter(t => t.status === 'IN_PROGRESS').length} 
          badgeText="İşlemde" 
          badgeColor="#FEF9C3"
          badgeTextColor="#CA8A04"
        />
        
        <TaskOverviewCard 
          icon="alert-circle" 
          label="Acil Görevler" 
          count={tasks.filter(t => t.priority === 'HIGH').length} 
          badgeText="Yüksek Öncelik" 
          badgeColor="#FEE2E2"
          badgeTextColor="#DC2626"
        />
        
        <TaskOverviewCard 
          icon="check-circle" 
          label="Tamamlanan Görevler" 
          count={tasks.filter(t => t.status === 'COMPLETED').length} 
          badgeText="Tamamlandı" 
          badgeColor="#E8FFF3"
          badgeTextColor="#22C55E"
        />
      </ScrollView>

      {/* Filters Section */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Görevlerde ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Durum:</Text>
            <View style={styles.segmentedControl}>
              {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.segmentButton,
                    selectedFilter === status && styles.segmentButtonActive
                  ]}
                  onPress={() => setSelectedFilter(status)}
                >
                  <Text 
                    style={[
                      styles.segmentButtonText,
                      selectedFilter === status && styles.segmentButtonTextActive
                    ]}
                  >
                    {status === 'ALL' ? 'Tümü' : 
                     status === 'OPEN' ? 'Açık' : 
                     status === 'IN_PROGRESS' ? 'İşlemde' : 'Tamamlandı'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sırala:</Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => {
                Alert.alert(
                  "Sıralama Seçin",
                  "",
                  [
                    { text: "Tarihe Göre", onPress: () => setSortBy('dueDate') },
                    { text: "Önceliğe Göre", onPress: () => setSortBy('priority') },
                    { text: "Başlığa Göre", onPress: () => setSortBy('title') },
                    { text: "Duruma Göre", onPress: () => setSortBy('status') },
                    { text: "İptal", style: "cancel" }
                  ]
                );
              }}
            >
              <Text style={styles.sortButtonText}>
                {sortBy === 'dueDate' ? 'Tarih' : 
                 sortBy === 'priority' ? 'Öncelik' : 
                 sortBy === 'title' ? 'Başlık' : 'Durum'}
              </Text>
              <Feather name="chevron-down" size={16} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <Feather 
                name={sortOrder === 'asc' ? "arrow-up" : "arrow-down"} 
                size={16} 
                color="#4B5563" 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsPriorityFilterVisible(true)}
          >
            <Feather name="filter" size={16} color="#4B5563" />
            <Text style={styles.filterButtonText}>Öncelik Filtresi</Text>
            {selectedPriorities.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedPriorities.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
        
        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <View style={styles.bulkActions}>
            <Text style={styles.bulkActionText}>
              {selectedItems.length} görev seçildi
            </Text>
            <View style={styles.bulkActionButtons}>
              <TouchableOpacity
                style={[styles.bulkActionButton, styles.completeButton]}
                onPress={() => handleBulkAction('complete')}
              >
                <Feather name="check" size={16} color="#22C55E" />
                <Text style={styles.completeButtonText}>Tamamla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.bulkActionButton, styles.bulkDeleteButton]}
                onPress={() => handleBulkAction('delete')}
              >
                <Feather name="trash-2" size={16} color="#EF4444" />
                <Text style={styles.bulkDeleteButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1649FF" />
          <Text style={styles.loadingText}>Görevler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={paginatedTasks}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.tasksList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={50} color="#D1D5DB" />
              <Text style={styles.emptyText}>Görev bulunamadı</Text>
            </View>
          }
          ListFooterComponent={
            filteredTasks.length > 0 ? (
              <View style={styles.pagination}>
                <View style={styles.paginationInfo}>
                  <Text style={styles.paginationText}>
                    {filteredTasks.length} görev içerisinde {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTasks.length)} arası gösteriliyor
                  </Text>
                </View>
                
                <View style={styles.paginationControls}>
                  <TouchableOpacity
                    style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                    onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <Text style={styles.paginationButtonText}>Önceki</Text>
                  </TouchableOpacity>
                  
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <TouchableOpacity
                        key={pageNum}
                        style={[
                          styles.paginationButton,
                          currentPage === pageNum && styles.paginationButtonActive
                        ]}
                        onPress={() => setCurrentPage(pageNum)}
                      >
                        <Text 
                          style={[
                            styles.paginationButtonText,
                            currentPage === pageNum && styles.paginationButtonTextActive
                          ]}
                        >
                          {pageNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  
                  <TouchableOpacity
                    style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                    onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <Text style={styles.paginationButtonText}>Sonraki</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
        />
      )}
      
      {/* Help Tip */}
      <View style={styles.helpTip}>
        <Feather name="info" size={20} color="#1E40AF" />
        <View style={styles.helpTipContent}>
          <Text style={styles.helpTipTitle}>Görevleri Yönetme</Text>
          <Text style={styles.helpTipText}>
            Birden fazla görevi aynı anda yönetmek için toplu işlemleri kullanabilirsiniz. Görevleri toplu olarak tamamlayabilir veya silebilirsiniz.
          </Text>
        </View>
      </View>
      
      {/* Priority Filter Modal */}
      <Modal
        visible={isPriorityFilterVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPriorityFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Öncelik Filtresi</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setIsPriorityFilterVisible(false)}
              >
                <Feather name="x" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {['HIGH', 'MEDIUM', 'LOW'].map((priority) => {
                const isSelected = selectedPriorities.includes(priority);
                return (
                  <TouchableOpacity
                    key={priority}
                    style={styles.priorityOption}
                    onPress={() => {
                      setSelectedPriorities(prev =>
                        prev.includes(priority)
                          ? prev.filter(p => p !== priority)
                          : [...prev, priority]
                      );
                    }}
                  >
                    <View style={styles.priorityOptionContent}>
                      <View 
                        style={[
                          styles.priorityBadge, 
                          { backgroundColor: getPriorityColor(priority).backgroundColor }
                        ]}
                      >
                        <Text style={{ color: getPriorityColor(priority).textColor }}>
                          {priority === 'HIGH' ? 'Yüksek' : 
                           priority === 'MEDIUM' ? 'Orta' : 'Düşük'}
                        </Text>
                      </View>
                      <Switch
                        value={isSelected}
                        onValueChange={(value) => {
                          setSelectedPriorities(prev =>
                            value
                              ? [...prev, priority]
                              : prev.filter(p => p !== priority)
                          );
                        }}
                        trackColor={{ false: "#E5E7EB", true: "#DBEAFE" }}
                        thumbColor={isSelected ? "#1649FF" : "#F3F4F6"}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setSelectedPriorities([])}
              >
                <Text style={styles.modalButtonText}>Temizle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalApplyButton]}
                onPress={() => setIsPriorityFilterVisible(false)}
              >
                <Text style={styles.modalApplyButtonText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1649FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
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
    backgroundColor: "#1649FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  overviewCardsContainer: {
    padding: 16,
    flexDirection: "row",
  },
  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: 150,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  overviewCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  overviewCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  overviewCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overviewCardBadgeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  overviewCardCount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  overviewCardLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  filtersScrollContent: {
    paddingBottom: 8,
  },
  filterGroup: {
    marginRight: 16,
  },
  filterLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  segmentedControl: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  segmentButtonActive: {
    backgroundColor: "#EEF2FF",
  },
  segmentButtonText: {
    fontSize: 14,
    color: "#4B5563",
  },
  segmentButtonTextActive: {
    color: "#1649FF",
    fontWeight: "500",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 8,
  },
  orderButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginLeft: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 6,
  },
  filterBadge: {
    backgroundColor: "#1649FF",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  bulkActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 12,
  },
  bulkActionText: {
    fontSize: 14,
    color: "#4B5563",
  },
  bulkActionButtons: {
    flexDirection: "row",
  },
  bulkActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: "#F0FDF4",
  },
  completeButtonText: {
    color: "#22C55E",
    marginLeft: 4,
  },
  bulkDeleteButton: {
    backgroundColor: "#FEF2F2",
  },
  bulkDeleteButtonText: {
    color: "#EF4444",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  tasksList: {
    padding: 16,
    paddingTop: 0,
  },
  taskItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedTaskItem: {
    borderWidth: 2,
    borderColor: "#1649FF",
  },
  taskHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1649FF",
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  taskLabels: {
    flexDirection: "row",
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDate: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
  },
  emptyContainer: {
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  pagination: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 16,
  },
  paginationInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    color: "#6B7280",
  },
  paginationControls: {
    flexDirection: "row",
    justifyContent: "center",
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  paginationButtonActive: {
    backgroundColor: "#1649FF",
    borderColor: "#1649FF",
  },
  paginationButtonText: {
    fontSize: 14,
    color: "#4B5563",
  },
  paginationButtonTextActive: {
    color: "#FFFFFF",
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  helpTip: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  helpTipContent: {
    flex: 1,
    marginLeft: 12,
  },
  helpTipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 4,
  },
  helpTipText: {
    fontSize: 14,
    color: "#3B82F6",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16, // Extra padding for iOS to account for bottom bar
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  priorityOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  priorityOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 14,
    color: "#4B5563",
  },
  modalApplyButton: {
    backgroundColor: "#1649FF",
  },
  modalApplyButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
});

export default TasksScreen;