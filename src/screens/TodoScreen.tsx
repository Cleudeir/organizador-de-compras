import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {ChatGPT35} from '../services/ChatGPT35';
import AsyncStorage from '@react-native-community/async-storage';

interface TodoItem {
  id: string;
  text: string;
  quantity: string;
  unit: string;
}

const TodoScreen: React.FC = ({navigation}) => {
  const [todoText, setTodoText] = useState<string>('');
  const [loading, setLoading] = useState<string>(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  const addTodo = () => {
    if (todoText.trim() !== '') {
      setTodos(prevTodos => [
        ...prevTodos,
        {
          id: Date.now().toString(),
          text: todoText,
          quantity: '1',
          unit: '',
        },
      ]);
      setTodoText('');
    }
  };

  useEffect(() => {
    const loadTodoList = async () => {
      try {
        const storedList = await AsyncStorage.getItem('@todoList');
        if (storedList) {
          setTodos(JSON.parse(storedList));
        }
      } catch (error) {
        console.error('Error loading todo list from AsyncStorage:', error);
      }
    };

    loadTodoList();
  }, []);

  useEffect(() => {
    const saveTodoList = async () => {
      try {
        await AsyncStorage.setItem('@todoList', JSON.stringify(todos));
      } catch (error) {
        console.error('Error saving todo list to AsyncStorage:', error);
      }
    };

    saveTodoList();
  }, [todos]);

  const removeTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  const updateTodoQuantity = (id: string, quantity: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo => (todo.id === id ? {...todo, quantity} : todo)),
    );
  };

  const updateTodoUnit = (id: string, unit: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo => (todo.id === id ? {...todo, unit} : todo)),
    );
  };

  function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  const navigateToCategoryScreen = async () => {
    const list = todos.map(todo => todo.text);
    console.log('list:', list);
    setLoading(true);
    const categories = await ChatGPT35(list);
    console.log('categories:', categories);
    Object.keys(categories).forEach(key => {
      categories[key] = categories[key].map((product: string) => {
        const element = todos.find(todo =>
          removeAccents(product.toLowerCase()).includes(
            removeAccents(todo.text.toLowerCase()),
          ),
        );
        if (element) {
          return (
            element.quantity +
            ' ' +
            (element.unit || 'unidade') +
            ' - ' +
            product
          );
        }
      });
    });
    console.log('categories:', categories);
    navigation.navigate('Categorias', categories);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return !loading ? (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome do produto"
          value={todoText}
          placeholderTextColor={'#ccc'}
          onSubmitEditing={addTodo}
          onChangeText={text => setTodoText(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonLabel}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        style={styles.todoList}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <View style={styles.todoItem}>
            <View style={styles.todoDetails}>
              <View style={styles.row}>
                <Text style={styles.todoText}>{item.text}</Text>
                <View style={styles.row}>
                  <TextInput
                    style={styles.quantityInput}
                    placeholderTextColor={'#ccc'}
                    placeholder="Quantidade"
                    value={item.quantity}
                    onChangeText={text => updateTodoQuantity(item.id, text)}
                  />
                  <TextInput
                    style={styles.unitInput}
                    placeholderTextColor={'#ccc'}
                    placeholder="Unidade"
                    value={item.unit}
                    onChangeText={text => updateTodoUnit(item.id, text)}
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => removeTodo(item.id)}
              style={styles.removeButton}>
              <Text style={styles.removeButtonText}>del</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.categoryButton}
        onPress={navigateToCategoryScreen}>
        <Text style={styles.categoryButtonText}>Organizar</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  todoList: {
    height: '70%',
  },
  loading: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#61dafb',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 16,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: '#ff6347',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  todoDetails: {
    flex: 1,
  },
  quantityInput: {
    width: 30,
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    borderBottomWidth: 1, // Border width at the bottom
    borderBottomColor: '#333', // Border color
  },
  unitInput: {
    width: 70,
    marginRight: 8,
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
    color: '#333',
    borderBottomWidth: 1, // Border width at the bottom
    borderBottomColor: '#333', // Border color
  },

  todoText: {
    fontSize: 16,
    color: '#333',
    width: '60%',
  },
  categoryButton: {
    backgroundColor: '#61dafb',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TodoScreen;
