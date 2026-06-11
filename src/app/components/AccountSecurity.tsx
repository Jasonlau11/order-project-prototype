import { useState } from 'react';
import { ArrowLeft, Smartphone, Mail, Lock, X } from 'lucide-react';

interface AccountSecurityProps {
  userInfo: {
    userId: string;
    nickname: string;
    phone: string;
    email?: string;
  };
  onBack: () => void;
  onUpdatePhone: (phone: string) => void;
  onUpdateEmail: (email: string) => void;
}

type EditingField = null | 'phone' | 'email' | 'password';
type PhoneStep = 'verify' | 'change';
type EmailStep = 'verify' | 'change';
type PasswordStep = 'verify' | 'change';

export function AccountSecurity({ userInfo, onBack, onUpdatePhone, onUpdateEmail }: AccountSecurityProps) {
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('verify');
  const [emailStep, setEmailStep] = useState<EmailStep>('verify');
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('verify');
  const [newValue, setNewValue] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (editingField === 'password') {
      if (passwordStep === 'verify') {
        if (!currentPassword) {
          setError('请输入当前密码');
          return;
        }
        // Mock: 当前密码验证（示例密码为 "123456"）
        if (currentPassword !== '123456') {
          setError('当前密码错误');
          return;
        }
        setError('');
        setPasswordStep('change');
        return;
      }
      if (!newValue) {
        setError('请输入新的值');
        return;
      }
      if (newValue !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
    } else if (editingField === 'phone') {
      if (!newValue) {
        setError('请输入新的值');
        return;
      }
      onUpdatePhone(newValue);
    } else if (editingField === 'email') {
      if (userInfo.email) {
        // Two-step flow when changing existing email
        if (emailStep === 'verify') {
          if (!verifyCode) {
            setError('请输入验证码');
            return;
          }
          setError('');
          setEmailStep('change');
          return;
        }
        if (!newValue) {
          setError('请输入新邮箱地址');
          return;
        }
      } else {
        // Single-step for first-time binding
        if (!newValue) {
          setError('请输入邮箱地址');
          return;
        }
      }
      onUpdateEmail(newValue);
    }
    setEditingField(null);
    setNewValue('');
    setVerifyCode('');
    setConfirmPassword('');
    setCurrentPassword('');
    setError('');
    setPhoneStep('verify');
    setEmailStep('verify');
    setPasswordStep('verify');
  };

  const closeModal = () => {
    setEditingField(null);
    setNewValue('');
    setVerifyCode('');
    setConfirmPassword('');
    setCurrentPassword('');
    setError('');
    setPhoneStep('verify');
    setEmailStep('verify');
    setPasswordStep('verify');
  };

  return (
    <div className="h-full bg-[#f7f8fa] overflow-auto">
      {/* 头部 */}
      <div className="bg-white border-b border-[#eee] px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#333]" />
        </button>
        <h1 className="text-lg text-[#222]">账号与安全</h1>
      </div>

      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="bg-white rounded-md overflow-hidden">
          {/* 手机号 */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--bg-hover)]">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[var(--brand)]" />
              <div>
                <p className="text-sm text-[#333]">手机号</p>
                <p className="text-xs text-[#999] mt-0.5">{userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
              </div>
            </div>
            <button onClick={() => setEditingField('phone')} className="text-sm text-[var(--brand)] hover:underline">更换</button>
          </div>

          {/* 邮箱 */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--bg-hover)]">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[var(--brand)]" />
              <div>
                <p className="text-sm text-[#333]">邮箱</p>
                <p className="text-xs text-[#999] mt-0.5">{userInfo.email || '未绑定'}</p>
              </div>
            </div>
            <button onClick={() => setEditingField('email')} className="text-sm text-[var(--brand)] hover:underline">
              {userInfo.email ? '更换' : '绑定'}
            </button>
          </div>

          {/* 密码 */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[var(--brand)]" />
              <div>
                <p className="text-sm text-[#333]">登录密码</p>
                <p className="text-xs text-[#999] mt-0.5">已设置</p>
              </div>
            </div>
            <button onClick={() => setEditingField('password')} className="text-sm text-[var(--brand)] hover:underline">修改</button>
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {editingField && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={closeModal}>
          <div className="bg-white rounded-lg w-[380px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base text-[#222]">
                {editingField === 'phone' ? '更换手机号' : editingField === 'email' ? (userInfo.email ? '更换邮箱' : '绑定邮箱') : '修改密码'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-[var(--bg-hover)] rounded-full">
                <X className="w-4 h-4 text-[#999]" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Phone edit: two-step flow */}
              {editingField === 'phone' && phoneStep === 'verify' && (
                <>
                  <p className="text-xs text-[var(--text-secondary)]">为保障账号安全，请先验证当前手机号</p>
                  <div className="px-4 py-3 border border-[#e0e0e0] rounded-md text-sm bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                    {userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="验证码"
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value)}
                      className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                    />
                    <button className="px-4 py-3 bg-[var(--brand-bg)] text-[var(--brand)] rounded-md text-sm whitespace-nowrap hover:bg-[#e0e4ff]">
                      发送验证码
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={() => { if (!verifyCode) { setError('请输入验证码'); } else { setError(''); setPhoneStep('change'); } }}
                    className="w-full py-3 bg-[var(--brand)] text-white rounded-full text-sm hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    验证
                  </button>
                </>
              )}

              {editingField === 'phone' && phoneStep === 'change' && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#e4f5ec] rounded-md text-xs" style={{ color: 'var(--success)' }}>
                    <span>&#10003;</span> 当前手机号已验证
                  </div>
                  <input
                    type="text"
                    placeholder="新手机号"
                    value={newValue}
                    onChange={e => { setNewValue(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="验证码"
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value)}
                      className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                    />
                    <button className="px-4 py-3 bg-[var(--brand-bg)] text-[var(--brand)] rounded-md text-sm whitespace-nowrap hover:bg-[#e0e4ff]">
                      发送验证码
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={handleSave}
                    className="w-full py-3 bg-[var(--brand)] text-white rounded-full text-sm hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    确认更换
                  </button>
                </>
              )}

              {/* Email edit: two-step flow when replacing existing email */}
              {editingField === 'email' && userInfo.email && emailStep === 'verify' && (
                <>
                  <p className="text-xs text-[var(--text-secondary)]">为保障账号安全，请先验证当前邮箱</p>
                  <div className="px-4 py-3 border border-[#e0e0e0] rounded-md text-sm bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                    {userInfo.email.replace(/(.{2}).*(@.*)/, '$1***$2')}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="验证码"
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value)}
                      className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                    />
                    <button className="px-4 py-3 bg-[var(--brand-bg)] text-[var(--brand)] rounded-md text-sm whitespace-nowrap hover:bg-[#e0e4ff]">
                      发送验证码
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={() => { if (!verifyCode) { setError('请输入验证码'); } else { setError(''); setVerifyCode(''); setEmailStep('change'); } }}
                    className="w-full py-3 bg-[var(--brand)] text-white rounded-full text-sm hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    验证
                  </button>
                </>
              )}

              {editingField === 'email' && userInfo.email && emailStep === 'change' && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#e4f5ec] rounded-md text-xs" style={{ color: 'var(--success)' }}>
                    <span>&#10003;</span> 当前邮箱已验证
                  </div>
                  <input
                    type="text"
                    placeholder="新邮箱地址"
                    value={newValue}
                    onChange={e => { setNewValue(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="新邮箱验证码"
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value)}
                      className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                    />
                    <button className="px-4 py-3 bg-[var(--brand-bg)] text-[var(--brand)] rounded-md text-sm whitespace-nowrap hover:bg-[#e0e4ff]">
                      发送验证码
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={handleSave}
                    className="w-full py-3 bg-[var(--brand)] text-white rounded-full text-sm hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    确认更换
                  </button>
                </>
              )}

              {/* Email bind: single-step when first-time binding */}
              {editingField === 'email' && !userInfo.email && (
                <>
                  <input
                    type="text"
                    placeholder="邮箱地址"
                    value={newValue}
                    onChange={e => { setNewValue(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="验证码"
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value)}
                      className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                    />
                    <button className="px-4 py-3 bg-[var(--brand-bg)] text-[var(--brand)] rounded-md text-sm whitespace-nowrap hover:bg-[#e0e4ff]">
                      发送验证码
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={handleSave}
                    className="w-full py-3 bg-[var(--brand)] text-white rounded-full text-sm hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    确认
                  </button>
                </>
              )}

              {/* Password edit: two-step flow — verify current password first */}
              {editingField === 'password' && passwordStep === 'verify' && (
                <>
                  <p className="text-xs text-[var(--text-secondary)]">为保障账号安全，请先验证当前登录密码</p>
                  <input
                    type="password"
                    placeholder="当前密码"
                    value={currentPassword}
                    onChange={e => { setCurrentPassword(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={handleSave}
                    className="w-full py-3 bg-[var(--brand)] text-white rounded-full text-sm hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    验证
                  </button>
                </>
              )}

              {editingField === 'password' && passwordStep === 'change' && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#e4f5ec] rounded-md text-xs" style={{ color: 'var(--success)' }}>
                    <span>&#10003;</span> 当前密码已验证
                  </div>
                  <input
                    type="password"
                    placeholder="新密码"
                    value={newValue}
                    onChange={e => { setNewValue(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                  />
                  <input
                    type="password"
                    placeholder="确认新密码"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] bg-[var(--bg-hover)]"
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={handleSave}
                    className="w-full py-3 bg-[var(--brand)] text-white rounded-full text-sm hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    确认修改
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}