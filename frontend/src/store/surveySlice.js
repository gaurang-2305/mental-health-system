const initialState = {
  surveys: [],
  latestSurvey: null,
  latestResult: null,
  loading: false,
  submitting: false,
  error: null,
};

const ACTION_TYPES = {
  SET_LOADING: 'survey/setLoading',
  SET_SUBMITTING: 'survey/setSubmitting',
  SET_ERROR: 'survey/setError',
  SET_SURVEYS: 'survey/setSurveys',
  ADD_SURVEY: 'survey/addSurvey',
  SET_RESULT: 'survey/setResult',
  RESET: 'survey/reset',
};

export const surveyReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_SUBMITTING:
      return { ...state, submitting: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false, submitting: false };
    case ACTION_TYPES.SET_SURVEYS:
      return {
        ...state,
        surveys: action.payload,
        latestSurvey: action.payload[0] || null,
        loading: false,
      };
    case ACTION_TYPES.ADD_SURVEY:
      return {
        ...state,
        surveys: [action.payload, ...state.surveys],
        latestSurvey: action.payload,
        submitting: false,
      };
    case ACTION_TYPES.SET_RESULT:
      return { ...state, latestResult: action.payload };
    case ACTION_TYPES.RESET:
      return initialState;
    default:
      return state;
  }
};

export const surveyActions = {
  setLoading: (v) => ({ type: ACTION_TYPES.SET_LOADING, payload: v }),
  setSubmitting: (v) => ({ type: ACTION_TYPES.SET_SUBMITTING, payload: v }),
  setError: (e) => ({ type: ACTION_TYPES.SET_ERROR, payload: e }),
  setSurveys: (data) => ({ type: ACTION_TYPES.SET_SURVEYS, payload: data }),
  addSurvey: (s) => ({ type: ACTION_TYPES.ADD_SURVEY, payload: s }),
  setResult: (r) => ({ type: ACTION_TYPES.SET_RESULT, payload: r }),
  reset: () => ({ type: ACTION_TYPES.RESET }),
};

const surveySlice = {
  initialState,
  reducer: surveyReducer,
  actions: surveyActions,
};

export default surveySlice;