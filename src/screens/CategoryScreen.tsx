import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface CategoryScreenProps {
  route: {
    params: {
      categories: Record<string, string[]>;
    };
  };
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({route}) => {
  const categories = route.params;
  let count = 0;
  const [categoryData, setCategoryData] = useState<{
    [key: string]: {id: string; text: string; completed: boolean}[];
  }>(
    Object.fromEntries(
      Object.keys(categories).map((category, index) => [
        category,
        (categories[category] || [])
          .filter(text => text !== undefined)
          .map((text, id) => {
            count++;
            return {
              order: count < 10 ? `0${count}` : count,
              id: id.toString(),
              text,
              completed: false,
            };
          }),
      ]),
    ),
  );
  const categoryKeys = Object.keys(categories);

  const handleToggleCompleted = (category: string, itemId: string) => {
    setCategoryData(prevData => {
      const updatedData = {...prevData};
      const categoryItems = updatedData[category];
      const updatedCategoryItems = categoryItems.map(item =>
        item.id === itemId ? {...item, completed: !item.completed} : item,
      );
      updatedData[category] = updatedCategoryItems;
      return updatedData;
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {categoryKeys.map(category => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {categoryData[category].map(item => (
              <TouchableOpacity
                onPress={() => handleToggleCompleted(category, item.id)}>
                <View style={styles.todoItem}>
                  <Text
                    style={[
                      styles.todoText,
                      item.completed && styles.completedTodo,
                    ]}>
                    {item.order} -{' '}
                  </Text>
                  <View style={styles.checkboxContainer}>
                    <View
                      style={[
                        styles.checkbox,
                        item.completed && styles.checkedCheckbox,
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.todoText,
                      item.completed && styles.completedTodo,
                    ]}>
                    {item.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6200ee',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6200ee',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  checkedCheckbox: {
    backgroundColor: '#6200ee',
  },
  todoText: {
    fontSize: 16,
    color: '#333',
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
});

export default CategoryScreen;
