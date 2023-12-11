import AsyncStorage from '@react-native-community/async-storage';
import {TOKEN_OPENAI} from '../../.env';

// Function to retrieve data from AsyncStorage
const getDataFromStorage = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error retrieving data from AsyncStorage:', e);
    return null;
  }
};

// Function to store data in AsyncStorage
const storeDataInStorage = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error storing data in AsyncStorage:', e);
  }
};

export const ChatGPT35 = async (todos: string[]) => {
  const cacheKey = JSON.stringify(todos);

  // Check if the response is already in AsyncStorage
  const cachedResponse = await getDataFromStorage(cacheKey);
  if (cachedResponse) {
    console.log('Using cached response for:', cacheKey);
    return cachedResponse;
  }

  const systemMessage = {
    role: 'system',
    content: `Haja como um assistem de compras, que eu possa ajudar a organizar suas compras, sua função é ordenar os itens por categoria de prateleira de supermercado
      responda como json {"categoria1":["item1", "item2", "item3"], "categoria2":["item1", "item2", "item3"], "categoria3":["item1", "item2", "item3"],...}
     `,
  };
  const userMessage = {
    role: 'user',
    content: `organize esta lista : ${todos.toString()}`,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN_OPENAI}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, userMessage],
      }),
    });
    console.log('Response:', response);

    const responseData = await response.json();

    try {
      const parsedResponse = JSON.parse(
        responseData.choices[0].message.content,
      );

      // Cache the response in AsyncStorage for future use
      await storeDataInStorage(cacheKey, parsedResponse);

      return parsedResponse;
    } catch (error) {
      return {todos: todos};
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
