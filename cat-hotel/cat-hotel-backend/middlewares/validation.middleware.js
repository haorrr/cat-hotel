const { body, validationResult } = require('express-validator');

// Kiểm tra kết quả validation
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// Validation cho đăng ký tài khoản
const registerValidation = [
  body('name')
    .notEmpty().withMessage('Tên không được để trống')
    .isLength({ min: 3 }).withMessage('Tên phải có ít nhất 3 ký tự'),
  
  body('email')
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ'),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  
  body('phone')
    .optional()
    .isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ')
];

// Validation cho đăng nhập
const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ'),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
];

// Validation cho thêm mèo mới
const catValidation = [
  body('name')
    .notEmpty().withMessage('Tên mèo không được để trống'),
  
  body('breed')
    .optional(),
  
  body('weight')
    .optional()
    .isFloat({ min: 0.1 }).withMessage('Cân nặng không hợp lệ'),
  
  body('birth_date')
    .optional()
    .isDate().withMessage('Ngày sinh không hợp lệ'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'unknown']).withMessage('Giới tính không hợp lệ')
];

// Validation cho đặt phòng
const bookingValidation = [
  body('room_id')
    .notEmpty().withMessage('ID phòng không được để trống')
    .isInt().withMessage('ID phòng phải là số nguyên'),
  
  body('cat_id')
    .notEmpty().withMessage('ID mèo không được để trống')
    .isInt().withMessage('ID mèo phải là số nguyên'),
  
  body('check_in_date')
    .notEmpty().withMessage('Ngày nhận phòng không được để trống')
    .isDate().withMessage('Ngày nhận phòng không hợp lệ'),
  
  body('check_out_date')
    .notEmpty().withMessage('Ngày trả phòng không được để trống')
    .isDate().withMessage('Ngày trả phòng không hợp lệ')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.check_in_date)) {
        throw new Error('Ngày trả phòng phải sau ngày nhận phòng');
      }
      return true;
    })
];

module.exports = {
  validateRequest,
  registerValidation,
  loginValidation,
  catValidation,
  bookingValidation
};
