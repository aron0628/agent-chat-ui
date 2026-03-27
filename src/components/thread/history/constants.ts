// Sidebar dimensions
export const SIDEBAR_WIDTH = 300;

// Thread display settings
export const MAX_THREAD_TITLE_LENGTH = 16;
export const SKELETON_LOADING_COUNT = 30;

// Styling constants
export const SCROLLBAR_STYLES =
  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent";

export const THREAD_ITEM_PADDING = "px-3 py-2";
export const ICON_SIZE_SM = "size-5";
export const BUTTON_SIZE_SM = "h-7 w-7";

// UI Text (Korean)
export const UI_TEXT = {
  newChat: "새 채팅",
  rename: "이름 바꾸기",
  delete: "삭제",
  deleteConfirm: "이 대화를 삭제하시겠습니까?",
  deleteSuccess: "대화가 삭제되었습니다",
  deleteError: "대화 삭제에 실패했습니다",
  updateSuccess: "대화 제목이 변경되었습니다",
  updateError: "제목 변경에 실패했습니다",
} as const;
