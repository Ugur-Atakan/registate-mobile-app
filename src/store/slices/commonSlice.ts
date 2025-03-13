import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface ModalContentType {
  title: string;
  description: string;
  type: 'Error' | 'Success' | 'Warning' | 'Info';
}
interface ModalState {
  visible: boolean;
  content: ModalContentType | null;
  autoHide: boolean;
}
interface CommonState {
  loading: boolean;
  modal: ModalState;
}
const initialState: CommonState = {
  loading: false,
  modal: {
    autoHide: false,
    visible: false,
    content: null,
  },
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    showModal: (
      state,
      action: PayloadAction<{
        autohide?: boolean;
        ModalContent: ModalContentType;
      }>,
    ) => {
      state.modal.visible = true;
      state.modal.content = action.payload.ModalContent;
      state.modal.autoHide = action.payload.autohide || false;
    },
    hideModal: state => {
      state.modal.visible = false;
      state.modal.content = null;
    },
  },
});

export const {setLoading, showModal, hideModal} = commonSlice.actions;

export default commonSlice.reducer;