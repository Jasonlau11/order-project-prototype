import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, QrCode, Eye, EyeOff, ArrowLeft, Layers, MessageSquare, Camera } from 'lucide-react';

type AuthTab = 'login' | 'register';
type LoginMethod = 'phone' | 'csdn' | 'code';
type RegisterStep = 'form' | 'verify';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userId: string, info: any) => void;
  onNavigateToAdminRegistration?: () => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess, onNavigateToAdminRegistration }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [registerStep, setRegisterStep] = useState<RegisterStep>('form');
  const [showPassword, setShowPassword] = useState(false);

  // 表单状态
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [loginCode, setLoginCode] = useState('');
  // P0-01: 邮箱绑定字段（选填）
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  // P0-02: 协议查看弹窗
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementType, setAgreementType] = useState<'terms' | 'privacy'>('terms');
  // P1-01: 忘记密码流程
  type ForgotStep = 'phone' | 'code' | 'newPassword';
  const [forgotStep, setForgotStep] = useState<ForgotStep | null>(null);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotCountdown, setForgotCountdown] = useState(0);
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // ── P0-02: 协议内容摘要 ──────────────────────────────────────────────────────
  const agreementContents: Record<'terms' | 'privacy', { title: string; sections: { subtitle: string; text: string }[] }> = {
    terms: {
      title: '用户服务协议',
      sections: [
        { subtitle: '一、总则', text: '本协议是您与CSDN订单管理系统（以下简称"本平台"）之间关于使用本平台服务所订立的协议。您在注册过程中勾选"我已阅读并同意"并完成注册，即表示您已充分阅读、理解并接受本协议的全部内容。' },
        { subtitle: '二、账号注册与使用', text: '您在注册时须提供真实、准确、完整的个人信息，并在信息变更时及时更新。您应对账号下的一切行为承担法律责任。账号仅限本人使用，不得以任何形式转让、出借或授权他人使用。' },
        { subtitle: '三、用户行为规范', text: '您在使用本平台服务时，应遵守国家法律法规，不得利用本平台从事违法违规活动，包括但不限于发布虚假信息、侵犯他人知识产权、进行商业贿赂、传播恶意代码等行为。' },
        { subtitle: '四、订单发布与承接', text: '客户发布订单应符合本平台订单发布规范，订单信息应真实、准确、完整。接单方承接订单后应按约定交付，双方应遵守诚实信用原则履行各自义务。' },
        { subtitle: '五、服务费用与结算', text: '本平台可能向您收取服务费用，具体收费标准以平台公示为准。结算方式与周期由双方订单约定或平台规则确定。' },
        { subtitle: '六、免责声明', text: '本平台作为技术服务提供方，不对订单双方的履约能力和履约结果承担担保责任。因不可抗力、系统维护等原因导致的服务中断，平台不承担责任。' },
        { subtitle: '七、协议变更', text: '本平台有权根据需要修改本协议条款，修改后的协议将在平台公布。如您不同意修改后的协议，应当停止使用本平台服务；继续使用则视为接受修改。' },
      ]
    },
    privacy: {
      title: '隐私政策',
      sections: [
        { subtitle: '一、信息收集', text: '我们收集您的个人信息包括：注册信息（手机号、昵称、头像等）、身份认证信息（企业资质材料等）、交易信息（订单发布与承接记录）、设备信息（设备型号、IP地址、浏览器类型等）。' },
        { subtitle: '二、信息使用', text: '我们使用收集的信息用于：为您提供平台服务、身份认证与审核、订单匹配与推荐、安全保障与风险控制、改善用户体验、法律合规要求等。' },
        { subtitle: '三、信息存储与保护', text: '您的个人信息存储于中华人民共和国境内。我们采用业界通行的安全技术和措施保护您的信息，包括但不限于数据加密、访问控制、安全审计等。' },
        { subtitle: '四、信息共享', text: '我们不会将您的个人信息出售或分享给第三方，但在以下情形中可能共享：获得您的明确同意、法律法规要求、与关联公司或合作伙伴共享以提供您所需服务（须签署保密协议）。' },
        { subtitle: '五、用户权利', text: '您有权查阅、更正、删除您的个人信息，有权撤回同意、注销账号。您可以通过平台客服或个人信息页中的入口行使上述权利。' },
        { subtitle: '六、Cookie与同类技术', text: '我们使用Cookie和类似技术来提升您的使用体验，包括保持登录状态、个性化推荐、安全防护等。您可通过浏览器设置管理Cookie。' },
        { subtitle: '七、政策更新', text: '我们可能适时更新本隐私政策。重大变更时，我们将通过站内信、弹窗等方式通知您。建议您定期查阅本政策以了解最新内容。' },
      ]
    }
  };
  const presetAvatars = [
    { id: 'avatar1', letter: 'A', color: 'var(--brand)', bg: 'var(--brand-subtle)' },
    { id: 'avatar2', letter: 'B', color: 'var(--brand)', bg: 'var(--brand-subtle)' },
    { id: 'avatar3', letter: 'C', color: 'var(--info)', bg: 'var(--info-bg)' },
    { id: 'avatar4', letter: 'D', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  ];

  const resetForm = () => {
    setPhone('');
    setPassword('');
    setNickname('');
    setVerifyCode('');
    setAgreed(false);
    setError('');
    setRegisterStep('form');
    setShowPassword(false);
    setConfirmPassword('');
    setSelectedAvatar('');
    setLoginCode('');
    setEmail('');
    setEmailCode('');
    setEmailCountdown(0);
    setEmailVerified(false);
    setIsLoading(false);
  };

  const switchTab = (newTab: AuthTab) => {
    setTab(newTab);
    resetForm();
  };

  const handleSendCode = () => {
    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendEmailCode = () => {
    if (!email) {
      setError('请先填写邮箱地址');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入正确的邮箱格式');
      return;
    }
    setError('');
    setEmailCountdown(60);
    const timer = setInterval(() => {
      setEmailCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    // 模拟验证码已发送，实际应调用后端API
  };

  const handleVerifyEmail = () => {
    if (!emailCode || emailCode.length < 4) {
      setError('请输入正确的邮箱验证码');
      return;
    }
    // 模拟验证通过
    setEmailVerified(true);
    setError('');
  };

  const handleLogin = () => {
    if (!phone || !password) {
      setError('请填写完整的登录信息');
      return;
    }
    setIsLoading(true);
    // 模拟登录
    setTimeout(() => {
      onLoginSuccess('user_' + Date.now(), {
        nickname: '用户' + phone.slice(-4),
        avatar: '',
        phone,
        email: ''
      });
      resetForm();
      setIsLoading(false);
    }, 500);
  };

  // P1-01: 密码强度计算
  const getPasswordStrength = (pwd: string): { level: 'weak' | 'medium' | 'strong'; label: string; color: string; width: string } => {
    if (!pwd) return { level: 'weak', label: '', color: '', width: '0%' };
    let types = 0;
    if (/[a-z]/.test(pwd)) types++;
    if (/[A-Z]/.test(pwd)) types++;
    if (/[0-9]/.test(pwd)) types++;
    if (/[^a-zA-Z0-9]/.test(pwd)) types++;
    if (pwd.length < 6) return { level: 'weak', label: '弱', color: 'var(--danger)', width: '33%' };
    if (pwd.length >= 8 && types >= 3) return { level: 'strong', label: '强', color: 'var(--success)', width: '100%' };
    if (pwd.length >= 6 && types >= 2) return { level: 'medium', label: '中', color: 'var(--warning)', width: '66%' };
    return { level: 'weak', label: '弱', color: 'var(--danger)', width: '33%' };
  };

  // P1-01: 忘记密码 — 发送验证码
  const handleForgotSendCode = () => {
    if (!forgotPhone || forgotPhone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
    setForgotCountdown(60);
    const timer = setInterval(() => {
      setForgotCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // P1-01: 忘记密码 — 验证并进入设置新密码
  const handleForgotVerify = () => {
    if (!forgotCode || forgotCode.length < 4) {
      setError('请输入正确的验证码');
      return;
    }
    setError('');
    setForgotStep('newPassword');
  };

  // P1-01: 忘记密码 — 重置密码
  const handleForgotReset = () => {
    if (forgotNewPassword.length < 6) {
      setError('密码至少需要6位');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    // 模拟重置成功
    setForgotSuccess(true);
  };

  // P1-01: 关闭忘记密码流程
  const closeForgotPassword = () => {
    setForgotStep(null);
    setForgotPhone('');
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotShowPassword(false);
    setForgotSuccess(false);
    setError('');
  };

  const handleSmsLogin = () => {
    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }
    if (!loginCode) {
      setError('请输入验证码');
      return;
    }
    // 模拟短信验证码登录
    onLoginSuccess('user_' + Date.now(), {
      nickname: '用户' + phone.slice(-4),
      avatar: '',
      phone,
      email: ''
    });
    resetForm();
  };

  const handleRegister = () => {
    if (registerStep === 'form') {
      if (!phone || !password || !nickname) {
        setError('请填写完整的注册信息');
        return;
      }
      if (password.length < 6) {
        setError('密码至少需要6位');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
      if (!selectedAvatar) {
        setError('请选择或上传头像');
        return;
      }
      if (!agreed) {
        setError('请阅读并同意《用户协议》和《隐私政策》');
        return;
      }
      // P0-01: 填写邮箱但未完成邮箱验证时阻止提交
      if (email && !emailVerified) {
        setError('请先完成邮箱验证');
        return;
      }
      setError('');
      setRegisterStep('verify');
      handleSendCode();
      return;
    }
    if (!verifyCode) {
      setError('请输入验证码');
      return;
    }
    setIsLoading(true);
    // 模拟注册成功
    setTimeout(() => {
      onLoginSuccess('user_' + Date.now(), {
        nickname,
        avatar: selectedAvatar,
        phone,
        email: emailVerified ? email : ''
      });
      resetForm();
      setIsLoading(false);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white rounded-lg w-[420px] max-h-[90vh] overflow-hidden shadow-[var(--shadow-modal)] pointer-events-auto" tabIndex={-1} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} onClick={e => e.stopPropagation()}>

        {/* 头部 — 深色极光风格 */}
        <div
          className="relative px-8 pt-8 pb-7 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #07091a 0%, #0d0b2e 55%, #12103d 100%)' }}
        >
          {/* Mini aurora orbs */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,106,61,0.55) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,139,92,0.45) 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full blur-xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,184,140,0.20) 0%, transparent 70%)' }}
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white/80 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)',
                boxShadow: '0 0 20px rgba(255,106,61,0.6)',
              }}
            >
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-white/45 tracking-wide">OPC Order</span>
          </div>

          <h2 className="relative text-xl text-white mb-1.5">
            {tab === 'login' ? '欢迎回来 👋' : registerStep === 'verify' ? '验证手机号' : '创建账号'}
          </h2>
          <p className="relative text-sm text-white/50">
            {tab === 'login'
              ? '登录后即可使用订单广场完整功能'
              : registerStep === 'verify'
              ? '验证码已发送至您的手机'
              : '注册后即可发布或承接订单'}
          </p>
        </div>

        <div className="px-8 pb-8 pt-6">
          {/* Tab 切换 */}
          {registerStep === 'form' && (
            <div className="flex gap-6 mb-6 border-b border-[var(--border-subtle)]">
              <button
                onClick={() => switchTab('login')}
                className={`pb-3 text-sm transition-colors relative ${tab === 'login' ? 'text-[var(--brand)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
              >
                登录
                {tab === 'login' && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, var(--brand), #FF8A62)' }} />}
              </button>
              <button
                onClick={() => switchTab('register')}
                className={`pb-3 text-sm transition-colors relative ${tab === 'register' ? 'text-[var(--brand)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
              >
                注册
                {tab === 'register' && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, var(--brand), #FF8A62)' }} />}
              </button>
            </div>
          )}

          {registerStep === 'verify' && (
            <button onClick={() => setRegisterStep('form')} className="flex items-center gap-1 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] mb-4">
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
          )}

          {/* 登录表单 */}
          {tab === 'login' && (
            <>
              {/* P1-01: 忘记密码流程 */}
              {forgotStep ? (
                <div className="space-y-4">
                  <button onClick={closeForgotPassword} className="flex items-center gap-1 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                    <ArrowLeft className="w-4 h-4" /> 返回登录
                  </button>

                  {!forgotSuccess ? (
                    <>
                      {forgotStep === 'phone' && (
                        <>
                          <p className="text-sm text-[var(--text-secondary)]">请输入您的手机号，我们将发送验证码</p>
                          <input
                            type="tel"
                            placeholder="手机号"
                            value={forgotPhone}
                            onChange={e => { setForgotPhone(e.target.value); setError(''); }}
                            maxLength={11}
                            className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)]"
                          />
                          {error && <p className="text-xs text-red-500">{error}</p>}
                          <button
                            onClick={() => { handleForgotSendCode(); setForgotStep('code'); }}
                            disabled={forgotPhone.length !== 11}
                            className={`w-full py-3 text-white rounded-md text-sm transition-opacity hover:opacity-90 ${forgotPhone.length !== 11 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)' }}
                          >
                            获取验证码
                          </button>
                        </>
                      )}

                      {forgotStep === 'code' && (
                        <>
                          <p className="text-sm text-[var(--text-secondary)]">验证码已发送至 <span className="text-[var(--text-primary)]">{forgotPhone}</span></p>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              placeholder="验证码"
                              value={forgotCode}
                              onChange={e => { setForgotCode(e.target.value); setError(''); }}
                              maxLength={6}
                              className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)]"
                            />
                            <button
                              onClick={handleForgotSendCode}
                              disabled={forgotCountdown > 0}
                              className={`px-4 py-3 rounded-md text-sm whitespace-nowrap ${forgotCountdown > 0 ? 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]' : 'bg-[var(--brand-subtle)] text-[var(--brand)] hover:bg-[#FFE1D5]'} transition-colors`}
                            >
                              {forgotCountdown > 0 ? `${forgotCountdown}s` : '重新发送'}
                            </button>
                          </div>
                          {error && <p className="text-xs text-red-500">{error}</p>}
                          <button
                            onClick={handleForgotVerify}
                            className="w-full py-3 text-white rounded-md text-sm transition-opacity hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)', boxShadow: '0 4px 14px rgba(255,106,61,0.35)' }}
                          >
                            验证
                          </button>
                        </>
                      )}

                      {forgotStep === 'newPassword' && (
                        <>
                          <p className="text-sm text-[var(--text-secondary)]">请设置新密码</p>
                          <div className="relative">
                            <input
                              type={forgotShowPassword ? 'text' : 'password'}
                              placeholder="新密码（至少6位）"
                              value={forgotNewPassword}
                              onChange={e => { setForgotNewPassword(e.target.value); setError(''); }}
                              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)] pr-10"
                            />
                            <button onClick={() => setForgotShowPassword(!forgotShowPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                              {forgotShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {/* 密码强度指示器 */}
                          {forgotNewPassword && (() => { const s = getPasswordStrength(forgotNewPassword); return (
                            <div className="mt-1.5">
                              <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-300" style={{ width: s.width, backgroundColor: s.color }} />
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[11px]" style={{ color: s.color }}>{s.label}</span>
                                <span className="text-[10px] text-[var(--text-disabled)]">建议包含字母、数字和特殊字符</span>
                              </div>
                            </div>
                          )})()}
                          <div className="relative">
                            <input
                              type={forgotShowPassword ? 'text' : 'password'}
                              placeholder="确认新密码"
                              value={forgotConfirmPassword}
                              onChange={e => { setForgotConfirmPassword(e.target.value); setError(''); }}
                              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)] pr-10"
                            />
                          </div>
                          {error && <p className="text-xs text-red-500">{error}</p>}
                          <button
                            onClick={handleForgotReset}
                            className="w-full py-3 text-white rounded-md text-sm transition-opacity hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)', boxShadow: '0 4px 14px rgba(255,106,61,0.35)' }}
                          >
                            重置密码
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--success-bg)' }}>
                        <svg className="w-7 h-7" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--text-primary)] font-medium">密码重置成功</p>
                      <p className="text-xs text-[var(--text-tertiary)]">请使用新密码重新登录</p>
                      <button
                        onClick={closeForgotPassword}
                        className="w-full py-3 text-white rounded-md text-sm transition-opacity hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)', boxShadow: '0 4px 14px rgba(255,106,61,0.35)' }}
                      >
                        返回登录
                      </button>
                    </div>
                  )}
                </div>
              ) : (
              <>
              {/* 登录方式切换 */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setLoginMethod('phone')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm transition-colors ${loginMethod === 'phone' ? 'bg-[var(--brand-subtle)] text-[var(--brand)] border border-[var(--brand)]/40' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-transparent'}`}
                >
                  <Smartphone className="w-4 h-4" /> 密码登录
                </button>
                <button
                  onClick={() => setLoginMethod('code')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm transition-colors ${loginMethod === 'code' ? 'bg-[var(--brand-subtle)] text-[var(--brand)] border border-[var(--brand)]/40' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-transparent'}`}
                >
                  <MessageSquare className="w-4 h-4" /> 验证码登录
                </button>
                <button
                  onClick={() => setLoginMethod('csdn')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm transition-colors ${loginMethod === 'csdn' ? 'bg-[var(--brand-subtle)] text-[var(--brand)] border border-[var(--brand)]/40' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-transparent'}`}
                >
                  <QrCode className="w-4 h-4" /> CSDN扫码
                </button>
              </div>

              {loginMethod === 'code' ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="tel"
                      placeholder="手机号"
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setError(''); }}
                      maxLength={11}
                      className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="验证码"
                      value={loginCode}
                      onChange={e => { setLoginCode(e.target.value); setError(''); }}
                      maxLength={6}
                      className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)]"
                    />
                    <button
                      onClick={handleSendCode}
                      disabled={countdown > 0}
                      className={`px-4 py-3 rounded-md text-sm whitespace-nowrap ${countdown > 0 ? 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]' : 'bg-[var(--brand-subtle)] text-[var(--brand)] hover:bg-[#FFE1D5]'} transition-colors`}
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={handleSmsLogin}
                    className="w-full py-3 text-white rounded-md text-sm transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)', boxShadow: '0 4px 14px rgba(255,106,61,0.35)' }}
                  >
                    登录
                  </button>
                </div>
              ) : loginMethod === 'phone' ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="tel"
                      placeholder="手机号"
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setError(''); }}
                      maxLength={11}
                      className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)]"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="密码"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      aria-invalid={!!error ? "true" : undefined}
                      aria-describedby={error ? "login-error" : undefined}
                      className="w-full px-4 py-3 border rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)] pr-10"
                      style={{ borderColor: error ? 'var(--danger)' : 'var(--border-default)' }}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {error && <p id="login-error" className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={handleLogin}
                    aria-disabled={isLoading ? "true" : undefined}
                    disabled={isLoading}
                    className="w-full py-3 text-white rounded-md text-sm transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)', boxShadow: '0 4px 14px rgba(255,106,61,0.35)' }}
                  >
                    登录
                  </button>
                  {/* P1-01: 忘记密码入口 */}
                  <div className="text-right mt-1.5">
                    <button
                      type="button"
                      onClick={() => { setForgotStep('phone'); setError(''); }}
                      className="text-xs text-[var(--text-tertiary)] hover:text-[var(--brand)] transition-colors"
                    >
                      忘记密码？
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  {/* P0-06: 模拟二维码（SVG绘制） */}
                  <div
                    className="relative w-44 h-44 bg-white rounded-lg border-2 border-[var(--border-subtle)] flex items-center justify-center mb-4 overflow-hidden"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
                  >
                    <svg width="148" height="148" viewBox="0 0 148 148" xmlns="http://www.w3.org/2000/svg">
                      {/* 二维码背景 */}
                      <rect width="148" height="148" rx="4" fill="white" />
                      {/* 定位图案（三个角） */}
                      {/* 左上 */}
                      <rect x="4" y="4" width="28" height="28" rx="2" fill="none" stroke="#0D0B2E" strokeWidth="6" />
                      <rect x="12" y="12" width="12" height="12" rx="1" fill="#0D0B2E" />
                      {/* 右上 */}
                      <rect x="116" y="4" width="28" height="28" rx="2" fill="none" stroke="#0D0B2E" strokeWidth="6" />
                      <rect x="124" y="12" width="12" height="12" rx="1" fill="#0D0B2E" />
                      {/* 左下 */}
                      <rect x="4" y="116" width="28" height="28" rx="2" fill="none" stroke="#0D0B2E" strokeWidth="6" />
                      <rect x="12" y="124" width="12" height="12" rx="1" fill="#0D0B2E" />
                      {/* 数据方块 */}
                      <rect x="44" y="4" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="60" y="4" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="76" y="4" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="100" y="4" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="44" y="16" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="68" y="16" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="84" y="16" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="52" y="28" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="76" y="28" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="4" y="44" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="20" y="44" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="36" y="44" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="60" y="44" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="92" y="44" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="108" y="44" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="132" y="44" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="12" y="56" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="36" y="56" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="68" y="56" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="84" y="56" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="108" y="56" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="124" y="56" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="20" y="68" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="44" y="68" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="60" y="68" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="76" y="68" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="100" y="68" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="4" y="80" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="28" y="80" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="52" y="80" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="84" y="80" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="116" y="80" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="132" y="80" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="12" y="92" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="44" y="92" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="68" y="92" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="100" y="92" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="20" y="104" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="36" y="104" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="52" y="104" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="84" y="104" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="108" y="104" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="124" y="104" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="44" y="116" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="68" y="116" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="92" y="116" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="108" y="116" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="132" y="116" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="52" y="128" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="76" y="128" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="100" y="128" width="8" height="8" rx="1" fill="#1A1A2E" />
                      <rect x="124" y="128" width="8" height="8" rx="1" fill="#1A1A2E" />
                      {/* 二维码中心Logo */}
                      <rect x="58" y="58" width="32" height="32" rx="6" fill="white" />
                      <svg x="62" y="62" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="4" fill="var(--brand)" />
                        <path d="M6 12L10 16L18 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </svg>
                    {/* 过期遮罩提示（演示用，默认不显示） */}
                  </div>
                  <p className="text-sm text-[var(--text-primary)] font-medium mb-1">
                    请使用 CSDN App 扫描二维码
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">
                    扫码后自动完成登录
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-disabled)]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                    </svg>
                    <span>未注册用户扫码后将自动创建账号</span>
                  </div>
                </div>
              )}
            </>
              )}
            </>
          )}

          {/* 运营人员注册入口 */}
          {tab === 'login' && onNavigateToAdminRegistration && (
            <div className="mt-5 text-center">
              <button
                onClick={() => { onNavigateToAdminRegistration(); onClose(); }}
                className="text-[12px] hover:underline transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                运营人员注册
              </button>
            </div>
          )}

          {/* 注册表单 */}
          {tab === 'register' && registerStep === 'form' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="昵称"
                value={nickname}
                onChange={e => { setNickname(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)]"
              />
              <input
                type="tel"
                placeholder="手机号"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError(''); }}
                maxLength={11}
                className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)]"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="设置密码（至少6位）"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  aria-invalid={!!error ? "true" : undefined}
                  aria-describedby={error ? "form-error" : undefined}
                  className="w-full px-4 py-3 border rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)] pr-10"
                  style={{ borderColor: error ? 'var(--danger)' : 'var(--border-default)' }}
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* P1-01: 密码强度指示器 */}
              {password && (() => { const s = getPasswordStrength(password); return (
                <div className="mt-1.5">
                  <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: s.width, backgroundColor: s.color }} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px]" style={{ color: s.color }}>{s.label}</span>
                    <span className="text-[10px] text-[var(--text-disabled)]">建议包含字母、数字和特殊字符</span>
                  </div>
                </div>
              )})()}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="确认密码"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  aria-invalid={!!error ? "true" : undefined}
                  aria-describedby={error ? "form-error" : undefined}
                  className="w-full px-4 py-3 border rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)] pr-10"
                  style={{ borderColor: error ? 'var(--danger)' : 'var(--border-default)' }}
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* P0-01: 邮箱绑定字段（选填） */}
              <div>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="邮箱（选填）"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailVerified(false); setError(''); }}
                    aria-invalid={!!error ? "true" : undefined}
                    aria-describedby={error ? "form-error" : undefined}
                    className="flex-1 px-4 py-3 border rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)]"
                    style={{ borderColor: error ? 'var(--danger)' : 'var(--border-default)' }}
                  />
                  {!emailVerified && email && (
                    <button
                      onClick={handleSendEmailCode}
                      disabled={emailCountdown > 0}
                      className={`px-4 py-3 rounded-md text-sm whitespace-nowrap ${emailCountdown > 0 ? 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]' : 'bg-[var(--brand-subtle)] text-[var(--brand)] hover:bg-[#FFE1D5]'} transition-colors`}
                    >
                      {emailCountdown > 0 ? `${emailCountdown}s` : '发送验证码'}
                    </button>
                  )}
                  {emailVerified && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-md text-xs text-green-600 bg-green-50 border border-green-200">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      已验证
                    </span>
                  )}
                </div>
                {email && !emailVerified && emailCountdown === 0 && (
                  <div className="flex gap-3 mt-2">
                    <input
                      type="text"
                      placeholder="邮箱验证码"
                      value={emailCode}
                      onChange={e => { setEmailCode(e.target.value); setError(''); }}
                      maxLength={6}
                      className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)]"
                    />
                    <button
                      onClick={handleVerifyEmail}
                      disabled={!emailCode}
                      className={`px-4 py-3 rounded-md text-sm whitespace-nowrap ${!emailCode ? 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]' : 'bg-[var(--brand)] text-white hover:opacity-90'} transition-colors`}
                    >
                      验证
                    </button>
                  </div>
                )}
              </div>
              {/* 头像选择 */}
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-2">选择头像</p>
                <div className="flex gap-3 items-center">
                  {presetAvatars.map(av => (
                    <button
                      key={av.id}
                      onClick={() => { setSelectedAvatar(av.id); setError(''); }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${selectedAvatar === av.id ? 'border-[var(--brand)] scale-110 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                      style={{ backgroundColor: av.bg, color: av.color }}
                    >
                      {av.letter}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedAvatar('upload')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed transition-all ${selectedAvatar === 'upload' ? 'border-[var(--brand)] text-[var(--brand)] bg-[var(--brand-subtle)]' : 'border-gray-300 text-[var(--text-tertiary)] hover:border-gray-400'}`}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 accent-[var(--brand)]" />
                <span className="text-xs text-[var(--text-tertiary)]">
                  我已阅读并同意{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setAgreementType('terms'); setShowAgreementModal(true); }}
                    className="text-[var(--brand)] underline underline-offset-2 hover:text-[#FF8A62] transition-colors"
                  >
                    《用户服务协议》
                  </button>
                  {' '}和{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setAgreementType('privacy'); setShowAgreementModal(true); }}
                    className="text-[var(--brand)] underline underline-offset-2 hover:text-[#FF8A62] transition-colors"
                  >
                    《隐私政策》
                  </button>
                </span>
                </label>
              {error && <p id="form-error" className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleRegister}
                aria-disabled={isLoading ? "true" : undefined}
                disabled={isLoading}
                className="w-full py-3 text-white rounded-md text-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)', boxShadow: '0 4px 14px rgba(255,106,61,0.35)' }}
              >
                下一步
              </button>
            </div>
          )}

          {/* 验证码步骤 */}
          {tab === 'register' && registerStep === 'verify' && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">验证码已发送至 <span className="text-[var(--text-primary)]">{phone}</span></p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="验证码"
                  value={verifyCode}
                  onChange={e => { setVerifyCode(e.target.value); setError(''); }}
                  maxLength={6}
                  className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[var(--brand)] transition-colors bg-[var(--bg-hover)]"
                />
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className={`px-4 py-3 rounded-md text-sm whitespace-nowrap ${countdown > 0 ? 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]' : 'bg-[var(--brand-subtle)] text-[var(--brand)] hover:bg-[#FFE1D5]'} transition-colors`}
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleRegister}
                aria-disabled={isLoading ? "true" : undefined}
                disabled={isLoading}
                className="w-full py-3 text-white rounded-md text-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)', boxShadow: '0 4px 14px rgba(255,106,61,0.35)' }}
              >
                完成注册
              </button>
            </div>
          )}
        </div>
      </div>

      {/* P0-02: 协议查看弹窗 */}
      {showAgreementModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110]" onClick={() => setShowAgreementModal(false)}>
          <div
            className="bg-white rounded-lg w-[520px] max-h-[70vh] flex flex-col shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {agreementContents[agreementType].title}
              </h3>
              <button
                onClick={() => setShowAgreementModal(false)}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-hover)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
              {agreementContents[agreementType].sections.map((section, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">{section.subtitle}</h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{section.text}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-hover)]">
              <button
                onClick={() => setShowAgreementModal(false)}
                className="w-full py-2.5 text-white rounded-md text-sm hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #FF8A62 100%)' }}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}