export const moodSlice = {
  name: 'mood',
  initialState: {
    moods: [],
  },
  reducers: {
    addMood: (state, action) => {
      state.moods.push(action.payload);
    },
  },
};
