const initialState = {
  moodHistory: [],
  todayMood: null,
  avgMood: 0,
  loading: false,
  error: null,
  lastFetched: null,
};

const ACTION_TYPES = {
  SET_LOADING: 'mood/setLoading',
  SET_ERROR: 'mood/setError',
  SET_HISTORY: 'mood/setHistory',
  SET_TODAY: 'mood/setToday',
  ADD_ENTRY: 'mood/addEntry',
  SET_AVG: 'mood/setAvg',
  RESET: 'mood/reset',
};

export const moodReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTION_TYPES.SET_HISTORY:
      return {
        ...state,
        moodHistory: action.payload,
        loading: false,
        lastFetched: Date.now(),
        avgMood: action.payload.length
          ? Math.round(
              (action.payload.reduce((a, b) => a + b.mood_score, 0) / action.payload.length) * 10
            ) / 10
          : 0,
      };
    case ACTION_TYPES.SET_TODAY:
      return { ...state, todayMood: action.payload };
    case ACTION_TYPES.ADD_ENTRY:
      return {
        ...state,
        moodHistory: [action.payload, ...state.moodHistory],
        todayMood: action.payload,
      };
    case ACTION_TYPES.RESET:
      return initialState;
    default:
      return state;
  }
};

export const moodActions = {
  setLoading: (v) => ({ type: ACTION_TYPES.SET_LOADING, payload: v }),
  setError: (e) => ({ type: ACTION_TYPES.SET_ERROR, payload: e }),
  setHistory: (data) => ({ type: ACTION_TYPES.SET_HISTORY, payload: data }),
  setToday: (data) => ({ type: ACTION_TYPES.SET_TODAY, payload: data }),
  addEntry: (entry) => ({ type: ACTION_TYPES.ADD_ENTRY, payload: entry }),
  reset: () => ({ type: ACTION_TYPES.RESET }),
};

const moodSlice = {
  initialState,
  reducer: moodReducer,
  actions: moodActions,
};

export default moodSlice;