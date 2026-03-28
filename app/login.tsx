import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Login Screen - Adapted from web Login.jsx
export default function LoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [signupForm, setSignupForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [signupErrors, setSignupErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const validateLoginForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!loginForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      errors.email = 'Email is invalid';
    }
    if (!loginForm.password) {
      errors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const validateSignupForm = () => {
    const errors: { fullName?: string; email?: string; password?: string; confirmPassword?: string } = {};
    if (!signupForm.fullName) {
      errors.fullName = 'Full name is required';
    } else if (signupForm.fullName.length < 3) {
      errors.fullName = 'Full name must be at least 3 characters';
    }
    if (!signupForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupForm.email)) {
      errors.email = 'Email is invalid';
    }
    if (!signupForm.password) {
      errors.password = 'Password is required';
    } else if (signupForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleLoginFormChange = (field: string, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (loginErrors[field as keyof typeof loginErrors]) {
      setLoginErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignupFormChange = (field: string, value: string) => {
    setSignupForm(prev => ({ ...prev, [field]: value }));
    if (signupErrors[field as keyof typeof signupErrors]) {
      setSignupErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLoginSubmit = () => {
    const errors = validateLoginForm();
    if (Object.keys(errors).length === 0) {
      Alert.alert('Login Successful', `Welcome, ${loginForm.email}!`, [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
      setLoginForm({ email: '', password: '' });
      setLoginErrors({});
    } else {
      setLoginErrors(errors);
      Alert.alert('Validation Error', 'Please fix the errors in the form');
    }
  };

  const handleSignupSubmit = () => {
    const errors = validateSignupForm();
    if (Object.keys(errors).length === 0) {
      Alert.alert('Signup Successful', `Welcome, ${signupForm.fullName}!`, [
        { text: 'OK', onPress: () => {
          setSignupForm({ fullName: '', email: '', password: '', confirmPassword: '' });
          setSignupErrors({});
          setActiveTab('login');
        }}
      ]);
    } else {
      setSignupErrors(errors);
      Alert.alert('Validation Error', 'Please fix the errors in the form');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🏥</Text>
            <ThemedText type="title" style={styles.appTitle}>QuickCare</ThemedText>
            <ThemedText style={styles.appSubtitle}>Mobile Healthcare Management</ThemedText>
          </View>

          {/* Auth Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'login' && styles.tabActive]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                Signup
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          {activeTab === 'login' && (
            <View style={styles.formContainer}>
              <ThemedText type="subtitle" style={styles.formTitle}>Admin Login</ThemedText>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, loginErrors.email && styles.inputError]}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={loginForm.email}
                  onChangeText={(text) => handleLoginFormChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {loginErrors.email && <Text style={styles.errorText}>{loginErrors.email}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={[styles.input, loginErrors.password && styles.inputError]}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={loginForm.password}
                  onChangeText={(text) => handleLoginFormChange('password', text)}
                  secureTextEntry
                />
                {loginErrors.password && <Text style={styles.errorText}>{loginErrors.password}</Text>}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleLoginSubmit}>
                <Text style={styles.submitButtonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <View style={styles.formContainer}>
              <ThemedText type="subtitle" style={styles.formTitle}>Create Admin Account</ThemedText>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={[styles.input, signupErrors.fullName && styles.inputError]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  value={signupForm.fullName}
                  onChangeText={(text) => handleSignupFormChange('fullName', text)}
                  autoCapitalize="words"
                />
                {signupErrors.fullName && <Text style={styles.errorText}>{signupErrors.fullName}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, signupErrors.email && styles.inputError]}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={signupForm.email}
                  onChangeText={(text) => handleSignupFormChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {signupErrors.email && <Text style={styles.errorText}>{signupErrors.email}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={[styles.input, signupErrors.password && styles.inputError]}
                  placeholder="Create a password"
                  placeholderTextColor="#999"
                  value={signupForm.password}
                  onChangeText={(text) => handleSignupFormChange('password', text)}
                  secureTextEntry
                />
                {signupErrors.password && <Text style={styles.errorText}>{signupErrors.password}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, signupErrors.confirmPassword && styles.inputError]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  value={signupForm.confirmPassword}
                  onChangeText={(text) => handleSignupFormChange('confirmPassword', text)}
                  secureTextEntry
                />
                {signupErrors.confirmPassword && <Text style={styles.errorText}>{signupErrors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSignupSubmit}>
                <Text style={styles.submitButtonText}>Signup</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  appSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

