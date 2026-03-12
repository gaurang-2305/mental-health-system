// Auth state slice — simple state object pattern for use with useReducer or local state
// Compatible with both Redux Toolkit and plain React useReducer

const initialState = {
  user: null,
  profile: null,
  role: 'student',
  loading: true,
  error: null,
  isAuthenticated: false,
};

const ACTION_TYPES = {
  SET_USER: 'auth/setUser',
  SET_PROFILE: 'auth/setProfile',
  SET_LOADING: 'auth/setLoading',
  SET_ERROR: 'auth/setError',
  LOGOUT: 'auth/logout',
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    case ACTION_TYPES.SET_PROFILE:
      return {
        ...state,
        profile: action.payload,
        role: action.payload?.roles?.name || 'student',
      };
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTION_TYPES.LOGOUT:
      return { ...initialState, loading: false };
    default:
      return state;
  }
};

export const authActions = {
  setUser: (user) => ({ type: ACTION_TYPES.SET_USER, payload: user }),
  setProfile: (profile) => ({ type: ACTION_TYPES.SET_PROFILE, payload: profile }),
  setLoading: (loading) => ({ type: ACTION_TYPES.SET_LOADING, payload: loading }),
  setError: (error) => ({ type: ACTION_TYPES.SET_ERROR, payload: error }),
  logout: () => ({ type: ACTION_TYPES.LOGOUT }),
};

const authSlice = {
  initialState,
  reducer: authReducer,
  actions: authActions,
};

export default authSlice;