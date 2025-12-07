import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import itemApi from '@/api/items';

export const useItemStore = defineStore('item', () => {
  // 状态
  const items = ref([]);
  const currentItem = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const pagination = ref({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const filters = ref({
    type: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // 计算属性
  const hasMoreItems = computed(() => {
    return pagination.value.page < pagination.value.totalPages;
  });

  const itemCount = computed(() => {
    return pagination.value.total;
  });

  const loadingMore = ref(false);

  // 获取内容列表
  const fetchItems = async (params = {}) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const queryParams = {
        ...filters.value,
        ...params,
        page: params.page || pagination.value.page,
        limit: params.limit || pagination.value.limit
      };
      
      const response = await itemApi.getItems(queryParams);
      
      if (response.code === 200) {
        items.value = response.data.items;
        pagination.value = {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        };
        
        console.log(`✅ 获取到 ${items.value.length} 条内容`);
      }
    } catch (err) {
      error.value = err.message;
      console.error('❌ 获取内容列表失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 加载更多内容
  const loadMoreItems = async () => {
    if (loadingMore.value || !hasMoreItems.value) return;
    
    try {
      loadingMore.value = true;
      
      const nextPage = pagination.value.page + 1;
      const response = await itemApi.getItems({
        ...filters.value,
        page: nextPage,
        limit: pagination.value.limit
      });
      
      if (response.code === 200) {
        items.value = [...items.value, ...response.data.items];
        pagination.value = {
          ...pagination.value,
          page: response.data.page,
          total: response.data.total,
          totalPages: response.data.totalPages
        };
        
        console.log(`✅ 加载了 ${response.data.items.length} 条更多内容`);
      }
    } catch (err) {
      console.error('❌ 加载更多内容失败:', err);
    } finally {
      loadingMore.value = false;
    }
  };

  // 获取单个内容
  const fetchItemById = async (id) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await itemApi.getItemById(id);
      
      if (response.code === 200) {
        currentItem.value = response.data.item;
        console.log(`✅ 获取到内容: ${currentItem.value.title}`);
      }
    } catch (err) {
      error.value = err.message;
      console.error('❌ 获取内容失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 创建内容
  const createItem = async (itemData) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await itemApi.createItem(itemData);
      
      if (response.code === 201) {
        // 将新内容添加到列表开头
        items.value.unshift(response.data.item);
        pagination.value.total += 1;
        
        console.log(`✅ 创建内容成功: ${response.data.item.title}`);
        return response.data.item;
      }
    } catch (err) {
      error.value = err.message;
      console.error('❌ 创建内容失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新内容
  const updateItem = async (id, itemData) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await itemApi.updateItem(id, itemData);
      
      if (response.code === 200) {
        // 更新当前内容
        if (currentItem.value && currentItem.value._id === id) {
          currentItem.value = { ...currentItem.value, ...itemData };
        }
        
        // 更新列表中的内容
        const index = items.value.findIndex(item => item._id === id);
        if (index !== -1) {
          items.value[index] = { ...items.value[index], ...itemData };
        }
        
        console.log(`✅ 更新内容成功: ${id}`);
      }
    } catch (err) {
      error.value = err.message;
      console.error('❌ 更新内容失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除内容
  const deleteItem = async (id) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await itemApi.deleteItem(id);
      
      if (response.code === 200) {
        // 从列表中移除
        items.value = items.value.filter(item => item._id !== id);
        pagination.value.total -= 1;
        
        // 如果删除的是当前查看的内容，清空currentItem
        if (currentItem.value && currentItem.value._id === id) {
          currentItem.value = null;
        }
        
        console.log(`✅ 删除内容成功: ${id}`);
      }
    } catch (err) {
      error.value = err.message;
      console.error('❌ 删除内容失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 获取热门内容
  const fetchTopRatedItems = async (limit = 10) => {
    try {
      isLoading.value = true;
      const response = await itemApi.getTopRatedItems(limit);
      return response.code === 200 ? response.data.items : [];
    } catch (err) {
      console.error('❌ 获取热门内容失败:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // 获取最新内容
  const fetchLatestItems = async (limit = 10) => {
    try {
      isLoading.value = true;
      const response = await itemApi.getLatestItems(limit);
      return response.code === 200 ? response.data.items : [];
    } catch (err) {
      console.error('❌ 获取最新内容失败:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // 获取类型统计
  const fetchTypeStats = async () => {
    try {
      const response = await itemApi.getTypeStats();
      return response.code === 200 ? response.data.stats : [];
    } catch (err) {
      console.error('❌ 获取类型统计失败:', err);
      return [];
    }
  };

  // 获取搜索建议
  const fetchSearchSuggestions = async (query, limit = 5) => {
    if (!query || query.trim().length === 0) return [];
    
    try {
      const response = await itemApi.getSearchSuggestions(query, limit);
      return response.code === 200 ? response.data.suggestions : [];
    } catch (err) {
      console.error('❌ 获取搜索建议失败:', err);
      return [];
    }
  };

  // 重置过滤器
  const resetFilters = () => {
    filters.value = {
      type: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    pagination.value.page = 1;
  };

  // 设置过滤器
  const setFilter = (key, value) => {
    filters.value[key] = value;
    pagination.value.page = 1;
  };

  // 清除错误
  const clearError = () => {
    error.value = null;
  };

  // 清除当前内容
  const clearCurrentItem = () => {
    currentItem.value = null;
  };

  return {
    // 状态
    items,
    currentItem,
    isLoading,
    loadingMore,
    error,
    pagination,
    filters,
    
    // 计算属性
    hasMoreItems,
    itemCount,
    
    // 方法
    fetchItems,
    loadMoreItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    fetchTopRatedItems,
    fetchLatestItems,
    fetchTypeStats,
    fetchSearchSuggestions,
    resetFilters,
    setFilter,
    clearError,
    clearCurrentItem
  };
});