import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "flowai_access_token";
const REFRESH_TOKEN_KEY = "flowai_refresh_token";

export async function saveAuthTokens(accessToken, refreshToken) {
  await AsyncStorage.setItem(TOKEN_KEY, accessToken);
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function clearAuthTokens() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}
