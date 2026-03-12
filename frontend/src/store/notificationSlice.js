const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const ACTION_TYPES = {
  SET_LOADING: 'notifications/setLoading',
  SET_ERROR: 'notifications/setError',
  SET_NOTIFICATIONS: 'notifications/setAll',
  ADD_NOTIFICATION: 'notifications/add',
  MARK_READ: 'notifications/markRead',
  MARK_ALL_READ: 'notifications/markAllRead',
  REMOVE: 'notifications/remove',
  RESET: 'notifications/reset',
};

export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTION_TYPES.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n) => !n.is_read).length,
        loading: false,
      };
    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case ACTION_TYPES.MARK_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case ACTION_TYPES.MARK_ALL_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      };
    case ACTION_TYPES.REMOVE:
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    case ACTION_TYPES.RESET:
      return initialState;
    default:
      return state;
  }
};

export const notificationActions = {
  setLoading: (v) => ({ type: ACTION_TYPES.SET_LOADING, payload: v }),
  setError: (e) => ({ type: ACTION_TYPES.SET_ERROR, payload: e }),
  setNotifications: (data) => ({ type: ACTION_TYPES.SET_NOTIFICATIONS, payload: data }),
  addNotification: (n) => ({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: n }),
  markRead: (id) => ({ type: ACTION_TYPES.MARK_READ, payload: id }),
  markAllRead: () => ({ type: ACTION_TYPES.MARK_ALL_READ }),
  remove: (id) => ({ type: ACTION_TYPES.REMOVE, payload: id }),
  reset: () => ({ type: ACTION_TYPES.RESET }),
};

const notificationSlice = {
  initialState,
  reducer: notificationReducer,
  actions: notificationActions,
};

export default notificationSlice;