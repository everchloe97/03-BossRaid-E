export const ErrorType = {
  invalideUser: { code: 400, msg: '유효한 사용자가 아닙니다!' },
  userExists: { code: 400, msg: '이미 존재하는 유저입니다!' },
  userNotFound: { code: 404, msg: '존재하지 않는 유저입니다!' },
  accountNotFound: { code: 404, msg: '존재하지 않는 가계부입니다!' },
  confirmPasswordDoesNotMatch: { code: 400, msg: '비밀번호와 비밀번호 확인이 일치하지 않습니다!' },
  emailExists: { code: 409, msg: '해당 이메일은 이미 사용중입니다!' },
  serverError: { code: 500, msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' },
};
