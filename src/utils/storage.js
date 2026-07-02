const INITIAL_DATA = {
  users: {},    
  entries: {}   
};

export const loadJSONData = () => {
  const data = localStorage.getItem('diary_db');
  if (!data) {
    localStorage.setItem('diary_db', JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(data);
};

export const saveJSONData = (data) => {
  localStorage.setItem('diary_db', JSON.stringify(data));
};