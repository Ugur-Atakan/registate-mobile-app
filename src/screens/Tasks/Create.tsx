import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import instance from "../../http/instance"; // HTTP instance reuse

const CreateTaskScreen = ({ navigation }:any) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [type, setType] = useState("GENERAL");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Optional fields (depending on your API)
  const [assignee, setAssignee] = useState("");
  const [company, setCompany] = useState("");
  
  const handleCreateTask = async () => {
    // Validate required fields
    if (!title.trim()) {
      Alert.alert("Hata", "Lütfen görev başlığını girin");
      return;
    }
    
    try {
      setLoading(true);
      
      const taskData = {
        title,
        description,
        priority,
        type,
        dueDate: dueDate.toISOString(),
        status: "OPEN", // Default status for new tasks
      };
      
      // Add optional fields if they exist
      if (assignee.trim()) taskData.assignee = assignee;
      if (company.trim()) taskData.company = company;
      
      await instance.post("/admin/task", taskData);
      
      Alert.alert(
        "Başarılı",
        "Görev başarıyla oluşturuldu",
        [
          { 
            text: "Tamam", 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Hata", "Görev oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

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
            <Feather name="x" size={20} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Görev Oluştur</Text>
          <TouchableOpacity
            style={[styles.saveButton, (!title.trim() || loading) && styles.saveButtonDisabled]}
            onPress={handleCreateTask}
            disabled={!title.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Görev Bilgileri</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Başlık *</Text>
              <TextInput
                style={styles.input}
                placeholder="Görev başlığını girin"
                value={title}
                onChangeText={setTitle}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Görev detaylarını açıklayın"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Öncelik</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    Alert.alert(
                      "Öncelik Seçin",
                      "",
                      [
                        { text: "Yüksek", onPress: () => setPriority("HIGH") },
                        { text: "Orta", onPress: () => setPriority("MEDIUM") },
                        { text: "Düşük", onPress: () => setPriority("LOW") },
                        { text: "İptal", style: "cancel" }
                      ]
                    );
                  }}
                >
                  <Text style={styles.selectButtonText}>
                    {priority === "HIGH" ? "Yüksek" : 
                     priority === "MEDIUM" ? "Orta" : "Düşük"}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#4B5563" />
                </TouchableOpacity>
              </View>
              
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Tür</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    Alert.alert(
                      "Görev Türü Seçin",
                      "",
                      [
                        { text: "Genel", onPress: () => setType("GENERAL") },
                        { text: "Yasal", onPress: () => setType("LEGAL") },
                        { text: "İdari", onPress: () => setType("ADMINISTRATIVE") },
                        { text: "İptal", style: "cancel" }
                      ]
                    );
                  }}
                >
                  <Text style={styles.selectButtonText}>
                    {type === "GENERAL" ? "Genel" : 
                     type === "LEGAL" ? "Yasal" : "İdari"}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#4B5563" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Son Tarih</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
                <Feather name="calendar" size={16} color="#4B5563" />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Atama Bilgileri (Opsiyonel)</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Şirket</Text>
              <TextInput
                style={styles.input}
                placeholder="Şirket adını girin"
                value={company}
                onChangeText={setCompany}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Atanacak Kişi</Text>
              <TextInput
                style={styles.input}
                placeholder="Görevin atanacağı kişi"
                value={assignee}
                onChangeText={setAssignee}
              />
            </View>
          </View>
          
          <View style={styles.helpBox}>
            <Feather name="info" size={20} color="#1E40AF" />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Görev Oluşturma İpuçları</Text>
              <Text style={styles.helpText}>
                • Görev başlığı kısa ve anlaşılır olmalıdır{"\n"}
                • Açıklamada görevi tamamlamak için gerekli tüm bilgileri sağlayın{"\n"}
                • Doğru öncelik ve görev türü seçerek kategorize edin
              </Text>
            </View>
          </View>
        </ScrollView>
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
  saveButton: {
    backgroundColor: "#1649FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#4B5563",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: "#4B5563",
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: "#4B5563",
  },
  helpBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  helpContent: {
    marginLeft: 12,
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: "#3B82F6",
    lineHeight: 20,
  },
});

export default CreateTaskScreen;