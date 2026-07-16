import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, TextInput,
  ScrollView, Alert, useWindowDimensions,
} from 'react-native';
import { Camera, Mail, Phone, MapPin, LogOut, ChevronRight, User, Shield, CreditCard, Bell, HelpCircle } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import { authAPI } from '../services/api';

const ProfileScreen = ({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) => {
  const { width } = useWindowDimensions();
  const [name, setName] = useState('Traveler');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await authAPI.getMe();
      setName(res.data.name || 'Traveler');
      setEmail(res.data.email || '');
      setPhone(res.data.phone || '');
    } catch (err) {}
  };

  const handlePhotoUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Save to backend later
      Alert.alert('Saved', 'Profile updated');
      setEditing(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save');
    }
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Profile" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoWrap} onPress={handlePhotoUpload} activeOpacity={0.8}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <User size={40} color="rgba(255,255,255,0.3)" strokeWidth={1.5} />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Camera size={14} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePhotoUpload}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            {editing ? (
              <TextInput
                style={styles.infoInput}
                value={name}
                onChangeText={setName}
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            ) : (
              <Text style={styles.infoValue}>{name}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            {editing ? (
              <TextInput
                style={styles.infoInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            ) : (
              <Text style={styles.infoValue}>{phone || 'Not set'}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => editing ? handleSave() : setEditing(true)}
          >
            <Text style={styles.editBtnText}>{editing ? 'Save Changes' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Shield size={18} color="rgba(255,255,255,0.5)" strokeWidth={2} />
            <Text style={styles.menuText}>Privacy & Security</Text>
            <ChevronRight size={16} color="rgba(255,255,255,0.2)" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <CreditCard size={18} color="rgba(255,255,255,0.5)" strokeWidth={2} />
            <Text style={styles.menuText}>Payment Methods</Text>
            <ChevronRight size={16} color="rgba(255,255,255,0.2)" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Bell size={18} color="rgba(255,255,255,0.5)" strokeWidth={2} />
            <Text style={styles.menuText}>Notifications</Text>
            <ChevronRight size={16} color="rgba(255,255,255,0.2)" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={18} color="rgba(255,255,255,0.5)" strokeWidth={2} />
            <Text style={styles.menuText}>Help & Support</Text>
            <ChevronRight size={16} color="rgba(255,255,255,0.2)" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <LogOut size={18} color="#CB2602" strokeWidth={2} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>TransEat v1.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16, paddingBottom: 40 },
  photoSection: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  photoWrap: {
    width: 100, height: 100, borderRadius: 50, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)', position: 'relative',
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#CB2602', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#0A0A0A',
  },
  changePhotoText: { color: '#f98015', fontSize: 13, fontWeight: '600', marginTop: 10 },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  infoInput: {
    fontSize: 14, color: '#FFFFFF', fontWeight: '600', textAlign: 'right',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    minWidth: 120,
  },
  editBtn: {
    marginTop: 16, backgroundColor: 'rgba(203,38,2,0.1)', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(203,38,2,0.2)',
  },
  editBtnText: { color: '#CB2602', fontSize: 14, fontWeight: '600' },
  menuSection: { marginBottom: 24 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  menuText: { flex: 1, fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 16, backgroundColor: 'rgba(203,38,2,0.08)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(203,38,2,0.15)', marginBottom: 16,
  },
  logoutText: { color: '#CB2602', fontSize: 14, fontWeight: '600' },
  version: { textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 },
});

export default ProfileScreen;