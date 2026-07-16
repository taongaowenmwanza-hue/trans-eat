import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, useWindowDimensions, ScrollView,
} from 'react-native';
import { Colors } from '../theme/colors';
import { authAPI } from '../services/api';

const AuthScreen = ({ onLogin, isPartner }: { onLogin: () => void; isPartner?: boolean }) => {
  const { width } = useWindowDimensions();
  const isSmall = width < 375;
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email'); return; }
    setLoading(true);
    try {
      await authAPI.sendOTP(email);
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Check your email for the OTP code');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp) { Alert.alert('Error', 'Please enter the OTP'); return; }
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP(email, otp, isPartner);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role || 'customer');
      onLogin();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.glassCard}>
          <Text style={[styles.title, isSmall && { fontSize: 20 }]}>
            {isPartner ? 'Restaurant Partner' : 'Welcome Back'}
          </Text>
          <Text style={[styles.subtitle, isSmall && { fontSize: 11 }]}>
            {isPartner ? 'Partner login for restaurant owners' : 'Sign in with your email to order ahead'}
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!otpSent}
            />
          </View>

          {otpSent && (
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>OTP Code</Text>
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor={Colors.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={otpSent ? handleVerifyOTP : handleSendOTP}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Please wait...' : otpSent ? 'Verify OTP' : 'Send OTP'}
            </Text>
          </TouchableOpacity>

          {otpSent && (
            <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.switchWrap}>
              <Text style={styles.switchText}>Use a different email</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: 'rgba(203,38,2,0.85)',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  switchWrap: { marginTop: 20, alignItems: 'center' },
  switchText: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
});

export default AuthScreen;