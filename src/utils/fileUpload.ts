import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vbggnlkzfnvwvvsfscee.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiZ2dubGt6Zm52d3Z2c2ZzY2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2ODgwOTAsImV4cCI6MjA1NDI2NDA5MH0.ha0zxTuN0qz9PSsJ-jrbiEQgI2ob-vLRHmECUOyHvRo";

const supabase = createClient(supabaseUrl, supabaseKey);

// Bucket adları
const BUCKETS = {
  profileImages: "profile-images",
  messageAttachments: "message-attachments",
  documents: "company-documents",
};

/**
 * Dosya adı oluşturur
 * - Profil fotoğrafları için `userId.jpg`
 * - Diğer dosyalar için `{UUID}_{timestamp}.{extension}`
 */
function generateFileName(userId: string | null, file: File, isProfileImage = false) {
  const extension = file.name.split('.').pop() || 'jpg';

  if (isProfileImage && userId) {
    return `${userId}.${extension}`; // Kullanıcı ID bazlı sabit dosya adı
  } 
    return `${crypto.randomUUID()}_${Date.now()}.${extension}`; // Rastgele dosya adı
}

/**
 * Genel Supabase dosya yükleme fonksiyonu
 * @param file Dosya objesi
 * @param bucketName Hedef bucket adı
 * @param folderPath Bucket içindeki klasör yolu
 * @param userId Kullanıcı ID (Profil fotoğrafları için gereklidir)
 * @returns Yüklenen dosyanın URL'si
 */
export async function uploadFileToSupabase(
  file: File,
  bucketName: string,
  folderPath: string,
  userId: string | null = null,
  isProfileImage = false
) {
  try {
    const fileName = generateFileName(userId, file, isProfileImage);
    console.log("File name:", fileName);
    const filePath = `${folderPath}/${fileName}`;

    //@ts-ignore
    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      contentType: file.type,
      upsert: isProfileImage, // Profil fotoğrafları için eski dosyayı üzerine yaz
    });

    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    // Public URL al
    const { publicUrl } = supabase.storage.from(bucketName).getPublicUrl(filePath).data
    console.log("Public URL:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

/**
 * Profil fotoğrafı yükler (Kullanıcı ID bazlı dosya ismi ile)
 * @param file Dosya objesi
 * @param userId Kullanıcı ID
 * @returns Yüklenen dosyanın URL'si
 */
export const uploadProfilePicture = async (file: File, userId: string) => {
  return await uploadFileToSupabase(file, BUCKETS.profileImages, "", userId, true);
};

/**
 * Mesaj ekini yükler (ticket veya task için)
 * @param file Dosya objesi
 * @param messageType "ticket" veya "task"
 * @returns Yüklenen dosyanın URL'si
 */
export const uploadMessageAttachment = async (file: File, messageType: "ticket" | "task") => {
  return await uploadFileToSupabase(file, BUCKETS.messageAttachments, messageType);
};

/**
 * Belge yükler (company, ein, annual, boi, other)
 * @param file Dosya objesi
 * @param documentType Belge türü (company, ein, annual, boi, other)
 * @returns Yüklenen dosyanın URL'si
 */
export const uploadDocument = async (file: File, documentType: string) => {
  return await uploadFileToSupabase(file, BUCKETS.documents, documentType);
};
