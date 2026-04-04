import { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  BackHandler,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';

const APP_URL = 'https://jmd-online-book.vercel.app';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [error, setError] = useState(false);
  const webViewRef = useRef(null);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  const handleDeepLink = useCallback((url) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `window.location.href = '${url}'; true;`
      );
    }
  }, []);

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) handleDeepLink(initialUrl);
    };
    getUrlAsync();

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    return () => subscription.remove();
  }, [handleDeepLink]);

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setLoading(navState.loading);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080b12" />
      <WebView
        ref={webViewRef}
        source={{ uri: APP_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleError}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={(request) => {
          if (request.url.startsWith(APP_URL)) return true;
          if (request.url.startsWith('https://')) {
            Linking.openURL(request.url);
            return false;
          }
          return true;
        }}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.loaderText}>Loading JMD Online Book...</Text>
          </View>
        )}
      />

      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>Connection Error</Text>
          <Text style={styles.errorSubtext}>Please check your internet connection</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080b12',
  },
  webview: {
    flex: 1,
  },
  loader: {
    flex: 1,
    backgroundColor: '#080b12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#93a0bb',
    marginTop: 16,
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 11, 18, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080b12',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#fb7185',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#93a0bb',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#080b12',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
