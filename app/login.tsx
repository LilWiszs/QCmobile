import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://192.168.1.22:8000';

export default function LoginScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [signupErrors, setSignupErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateLoginForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!loginForm.email) errors.email = 'Email/Username is required';
    if (!loginForm.password) errors.password = 'Password is required';

    return errors;
  };

  const validateSignupForm = () => {
    const errors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!signupForm.fullName) errors.fullName = 'Full name is required';
    if (!signupForm.email) errors.email = 'Email is required';
    if (!signupForm.password) errors.password = 'Password is required';
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

  const handleLoginSubmit = async () => {
    const errors = validateLoginForm();

    if (Object.keys(errors).length !== 0) {
      setLoginErrors(errors);
      Alert.alert('Validation Error', 'Please complete the login form.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api-token-auth/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.non_field_errors?.[0] || data.detail || 'Invalid username or password.');
        return;
      }

      console.log('LOGIN TOKEN:', data.token);
      (globalThis as any).authToken = data.token;

      Alert.alert('Login Successful', 'Welcome to QuickCare!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);

      setLoginForm({ email: '', password: '' });
      setLoginErrors({});
    } catch (error: any) {
      console.log('LOGIN ERROR:', error);
      Alert.alert('Login Error', error?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

const handleSignupSubmit = async () => {
  const errors = validateSignupForm();

  if (Object.keys(errors).length !== 0) {
    setSignupErrors(errors);
    Alert.alert('Validation Error', 'Please fix the errors in the form');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: signupForm.email,
        email: signupForm.email,
        password: signupForm.password,
        first_name: signupForm.fullName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert(
        'Signup Failed',
        data.username?.[0] ||
          data.email?.[0] ||
          data.password?.[0] ||
          data.detail ||
          'Unable to create account.'
      );
      return;
    }

    Alert.alert('Signup Successful', 'Account created. You may now login.', [
      {
        text: 'OK',
        onPress: () => {
          setSignupForm({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
          });
          setSignupErrors({});
          setLoginForm({
            email: signupForm.email,
            password: '',
          });
          setActiveTab('login');
        },
      },
    ]);
  } catch (error: any) {
    Alert.alert('Connection Error', error?.message || 'Cannot connect to backend server.');
  }
};

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.logo}>🏥</Text>
            <ThemedText type="title" style={styles.appTitle}>QuickCare</ThemedText>
            <ThemedText style={styles.appSubtitle}>Mobile Healthcare Management</ThemedText>
          </View>

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

          {activeTab === 'login' && (
            <View style={styles.formContainer}>
              <ThemedText type="subtitle" style={styles.formTitle}>Admin Login</ThemedText>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username / Email</Text>
                <TextInput
                  style={[styles.input, loginErrors.email && styles.inputError]}
                  placeholder="Enter username or email"
                  placeholderTextColor="#999"
                  value={loginForm.email}
                  onChangeText={(text) => handleLoginFormChange('email', text)}
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

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleLoginSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
  container: { flex: 1 },
  keyboardView: { flex: 1 },
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
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});