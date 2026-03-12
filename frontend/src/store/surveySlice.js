export const surveySlice = {
  name: 'survey',
  initialState: {
    surveys: [],
  },
  reducers: {
    addSurvey: (state, action) => {
      state.surveys.push(action.payload);
    },
  },
};
