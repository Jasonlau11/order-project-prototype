import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface AdminRegistrationProps {
  onNavigate: (page: string) => void;
}

interface FieldErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  realName?: string;
  employeeId?: string;
  phone?: string;
  verifyCode?: string;
  email?: string;
  department?: string;
}

const DEPARTMENTS = ['运营部', '技术部', '财务部', '客服部'];

export function AdminRegistration({ onNavigate }: AdminRegistrationProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [realName, setRealName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Toast 自动消失
  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  // 倒计时定时器
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = () => {
    if (sendingCode || countdown > 0) return;
    if (!phone.trim() || !/^\d{11}$/.test(phone.trim())) {
      setFieldErrors(prev => ({ ...prev, phone: '请输入正确的11位手机号' }));
      return;
    }
    setSendingCode(true);
    // 模拟发送验证码
    setTimeout(() => {
      setSendingCode(false);
      setCountdown(60);
      setToastMsg('验证码已发送');
    }, 500);
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!username.trim()) {
      errors.username = '请输入账号';
    } else if (!/^[a-zA-Z0-9]+$/.test(username.trim())) {
      errors.username = '账号只能包含字母和数字';
    }

    if (!password) {
      errors.password = '请输入密码';
    } else if (password.length < 6) {
      errors.password = '密码至少需要6位';
    }

    if (!confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    if (!realName.trim()) {
      errors.realName = '请输入姓名';
    }

    if (!employeeId.trim()) {
      errors.employeeId = '请输入工号';
    }

    if (!phone.trim()) {
      errors.phone = '请输入手机号';
    } else if (!/^\d{11}$/.test(phone.trim())) {
      errors.phone = '请输入正确的11位手机号';
    }

    if (!verifyCode.trim()) {
      errors.verifyCode = '请输入短信验证码';
    } else if (!/^\d{6}$/.test(verifyCode.trim())) {
      errors.verifyCode = '请输入6位数字验证码';
    }

    if (!email.trim()) {
      errors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = '请输入正确的邮箱格式';
    }

    if (!department) {
      errors.department = '请选择所属部门';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setSubmitted(true);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 border rounded-md text-sm outline-none transition-all bg-[var(--bg-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] ${
      hasError
        ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(227,77,77,0.15)]'
        : 'border-[var(--border-default)] focus:border-[var(--brand)] focus:shadow-[var(--shadow-glow)]'
    }`;

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-root)' }}>
        <div className="text-center p-10 rounded-md bg-white shadow-[var(--shadow-card)] border border-[var(--border-subtle)] max-w-sm w-full">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'var(--success-bg)' }}>
            <svg className="w-7 h-7" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">提交成功</h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-2">提交成功，等待超级管理员审批</p>

          <div className="flex items-center justify-center gap-1.5 mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-medium" style={{ borderColor: 'var(--warning)', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <Clock className="w-3.5 h-3.5" />
              审批中
            </div>
          </div>

          <button
            onClick={() => onNavigate('order')}
            className="w-full py-2.5 text-white rounded-md text-sm transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)',
            }}
          >
            返回登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--bg-root)' }}>
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-md text-sm font-medium shadow-lg transition-all"
          style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)' }}
        >
          {toastMsg}
        </div>
      )}
      <div className="max-w-md w-full">
        {/* Back link */}
        <button
          onClick={() => onNavigate('order')}
          className="flex items-center gap-1 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回登录
        </button>

        {/* Card */}
        <div className="bg-white rounded-md p-8 shadow-[var(--shadow-card)] border border-[var(--border-subtle)]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)',
              }}
            >
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-[var(--text-tertiary)] tracking-wide uppercase">Admin Registration</span>
          </div>

          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">运营账户注册</h1>
          <p className="text-sm text-[var(--text-tertiary)] mb-7">创建运营管理账号，用于管理订单平台</p>

          {/* Form */}
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                账号 <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                placeholder="请输入账号（字母和数字）"
                value={username}
                onChange={e => { setUsername(e.target.value); clearFieldError('username'); }}
                className={inputClass(!!fieldErrors.username)}
              />
              {fieldErrors.username && (
                <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                密码 <span className="text-[var(--danger)]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请设置密码（至少6位）"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
                  className={`${inputClass(!!fieldErrors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                确认密码 <span className="text-[var(--danger)]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                  className={`${inputClass(!!fieldErrors.confirmPassword)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Real Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                姓名 <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                placeholder="请输入真实姓名"
                value={realName}
                onChange={e => { setRealName(e.target.value); clearFieldError('realName'); }}
                className={inputClass(!!fieldErrors.realName)}
              />
              {fieldErrors.realName && (
                <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.realName}</p>
              )}
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                工号 <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                placeholder="请输入工号"
                value={employeeId}
                onChange={e => { setEmployeeId(e.target.value); clearFieldError('employeeId'); }}
                className={inputClass(!!fieldErrors.employeeId)}
              />
              {fieldErrors.employeeId && (
                <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.employeeId}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                手机号 <span className="text-[var(--danger)]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="请输入11位手机号"
                  value={phone}
                  maxLength={11}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); clearFieldError('phone'); }}
                  className={`flex-1 ${inputClass(!!fieldErrors.phone)}`}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || countdown > 0 || !phone.trim()}
                  className="shrink-0 px-4 py-2.5 rounded-md text-sm font-medium transition-all whitespace-nowrap"
                  style={
                    sendingCode || countdown > 0 || !phone.trim()
                      ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-disabled)', border: '1px solid var(--border-subtle)', cursor: 'not-allowed' }
                      : { backgroundColor: 'var(--brand)', color: '#fff', border: '1px solid var(--brand)' }
                  }
                >
                  {sendingCode ? '发送中...' : countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码'}
                </button>
              </div>
              {fieldErrors.phone && (
                <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Verify Code */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                验证码 <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                placeholder="请输入6位短信验证码"
                value={verifyCode}
                maxLength={6}
                onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, '')); clearFieldError('verifyCode'); }}
                className={inputClass(!!fieldErrors.verifyCode)}
              />
              {fieldErrors.verifyCode && (
                <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.verifyCode}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                邮箱 <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="email"
                placeholder="请输入邮箱地址"
                value={email}
                onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
                className={inputClass(!!fieldErrors.email)}
              />
              {fieldErrors.email && (
                <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                所属部门 <span className="text-[var(--danger)]">*</span>
              </label>
              <select
                value={department}
                onChange={e => { setDepartment(e.target.value); clearFieldError('department'); }}
                className={inputClass(!!fieldErrors.department)}
              >
                <option value="" disabled>请选择所属部门</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {fieldErrors.department && (
                <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.department}</p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full py-2.5 text-white rounded-md text-sm transition-opacity hover:opacity-90 mt-2"
              style={{
                background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)',
                boxShadow: '0 4px 14px rgba(255,106,61,0.35)',
              }}
            >
              提交注册
            </button>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-[var(--text-tertiary)] mt-5">
          已有账户？{' '}
          <button
            onClick={() => onNavigate('order')}
            className="text-[var(--brand)] hover:underline font-medium"
          >
            返回登录
          </button>
        </p>
      </div>
    </div>
  );
}
