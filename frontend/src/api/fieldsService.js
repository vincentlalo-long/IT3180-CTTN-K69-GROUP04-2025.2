import api from './axiosConfig';

/**
 * Lấy danh sách tất cả các sân bóng
 * @returns {Promise} Promise chứa danh sách các sân bóng
 */
export const getFields = async () => {
  try {
    const response = await api.get('/fields');
    return response.data;
  } catch (error) {
    console.error('Error fetching fields:', error);
    throw error;
  }
};
