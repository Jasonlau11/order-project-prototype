import { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderSquare } from './components/OrderSquare';
import { CustomerWorkbench } from './components/CustomerWorkbench';
import { OrderPublishPage } from './components/OrderPublishPage';
const MyOrders = lazy(() => import('./components/MyOrders').then(m => ({ default: m.MyOrders })));
const OperationDashboard = lazy(() => import('./components/OperationDashboard').then(m => ({ default: m.OperationDashboard })));
import { DevToolConfig } from './components/DevToolConfig';
import { AgreementTemplateConfig } from './components/AgreementTemplateConfig';
import { AuthModal } from './components/AuthModal';
import { GlobalNav } from './components/GlobalNav';
import { PersonalInfo } from './components/PersonalInfo';
import { AccountSecurity } from './components/AccountSecurity';
import { CustomerQualification } from './components/CustomerQualification';
import { UserQualification } from './components/UserQualification';
import { MessageCenter } from './components/MessageCenter';
import { MyBills } from './components/MyBills';
import { OperationConfigPage } from './components/OperationConfigPage';
import { AdminEntrance } from './components/AdminEntrance';
import { AdminRegistration } from './components/AdminRegistration';
import { ToastContainer } from './components/Toast';

type UserRole = 'first-visit' | 'customer' | 'user' | 'browse-only' | 'admin';
type CertStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface UserInfo {
  userId: string;
  nickname: string;
  avatar: string;
  phone: string;
  email?: string;
}

// ── Mock pre-filled certification data (simulates a previously submitted form) ─
const MOCK_CUSTOMER_CERT_DATA = {
  companyName: '北京示例科技有限公司',
  creditCode: '91110108MA01XXXXXX',
  address: '北京市朝阳区某某大厦 A 座 18 层',
  legalRepName: '张三',
  contactName: '李经理',
  contactTitle: '市场总监',
  contactPhone: '13812345678',
  contactEmail: 'contact@example.com',
};
const MOCK_CUSTOMER_CERT_REJECT_REASON =
  '营业执照图片不清晰，法定代表人身份证上的姓名与营业执照登记信息不一致，请重新上传清晰的证件照片并核对信息后重新提交。';

const MOCK_USER_CERT_DATA = {
  isTeam: false,
  teamName: '',
  capabilityIntro: '熟悉前端开发，掌握 React 和 Vue，参与过多个公司内部项目开发，有一定的独立交付能力。',
  qualificationCerts: '暂无',
};
const MOCK_USER_CERT_REJECT_REASON =
  '能力背景介绍过于简单，仅描述了技术方向但未提供具体项目经验。请补充至少 3 个完整项目案例（含项目规模、技术栈、您的角色及成果），并提供可验证的资质证书信息后重新提交。';

export default function App() {
  const [currentPage, setCurrentPage] = useState('order');
  const [userRole, setUserRole] = useState<UserRole>('first-visit');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(4);

  // ── Certification states ─────────────────────────────────────────────────────
  // Default to 'rejected' so the warning is immediately visible in demo
  const [customerCertStatus, setCustomerCertStatus] = useState<CertStatus>('rejected');
  const [userCertStatus, setUserCertStatus] = useState<CertStatus>('rejected');

  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    const savedUserRole = localStorage.getItem('userRole');
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        setUserInfo(parsed);
        setIsLoggedIn(true);
        if (savedUserRole) setUserRole(savedUserRole as UserRole);
      } catch (e) {
        console.error('Failed to parse saved user info:', e);
      }
    }
  }, []);

  const handleLoginSuccess = (userId: string, info: any) => {
    const newUserInfo: UserInfo = {
      userId,
      nickname: info.nickname,
      avatar: info.avatar,
      phone: info.phone,
      email: info.email,
    };
    setUserInfo(newUserInfo);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setUserRole('first-visit');
    setCurrentPage('order');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRole');
  };

  const requireLogin = (action: () => void) => {
    if (!isLoggedIn) {
      setPendingAction(() => action);
      setShowAuthModal(true);
    } else {
      action();
    }
  };

  const handleNavigateToMyOrders = () => {
    if (!isLoggedIn) {
      setPendingAction(() => () => setCurrentPage('myOrders'));
      setShowAuthModal(true);
    } else {
      setCurrentPage('myOrders');
    }
  };

  const handleNavigateToMyBills = () => {
    if (!isLoggedIn) {
      setPendingAction(() => () => setCurrentPage('myBills'));
      setShowAuthModal(true);
    } else {
      setCurrentPage('myBills');
    }
  };

  const handleNavigateToMessages = () => {
    if (!isLoggedIn) {
      setPendingAction(() => () => setCurrentPage('messageCenter'));
      setShowAuthModal(true);
    } else {
      setCurrentPage('messageCenter');
    }
  };

  const handleNavigateToProfile = () => requireLogin(() => setCurrentPage('personalInfo'));
  const handleNavigateToSecurity = () => requireLogin(() => setCurrentPage('accountSecurity'));

  const handleUpdateUserInfo = (updates: { nickname?: string; avatar?: string }) => {
    if (userInfo) {
      const newUserInfo = { ...userInfo, ...updates };
      setUserInfo(newUserInfo);
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    }
  };

  const handleUpdatePhone = (newPhone: string) => {
    if (userInfo) {
      const newUserInfo = { ...userInfo, phone: newPhone };
      setUserInfo(newUserInfo);
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    }
  };

  const handleUpdateEmail = (newEmail: string) => {
    if (userInfo) {
      const newUserInfo = { ...userInfo, email: newEmail };
      setUserInfo(newUserInfo);
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    }
  };

  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role);
    setCurrentPage('order');
    localStorage.setItem('userRole', role);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-page)' }}>
      <GlobalNav
        userRole={userRole}
        isLoggedIn={isLoggedIn}
        userInfo={userInfo || undefined}
        currentPage={currentPage}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateTo={setCurrentPage}
        onNavigateToMyOrders={handleNavigateToMyOrders}
        onNavigateToMyBills={handleNavigateToMyBills}
        onNavigateToMessages={handleNavigateToMessages}
        onPublishOrder={() => setCurrentPage('order-publish')}
        unreadMessageCount={isLoggedIn ? unreadMessageCount : 0}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingAction(null); }}
        onLoginSuccess={handleLoginSuccess}
        onNavigateToAdminRegistration={() => setCurrentPage('adminRegistration')}
      />

      <AdminEntrance
        userRole={userRole}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
        {currentPage === 'order' && (
          userRole === 'customer' ? (
            <CustomerWorkbench
              userRole={userRole}
              setUserRole={handleSetUserRole}
              setCurrentPage={setCurrentPage}
              onNavigateToMyOrders={handleNavigateToMyOrders}
              isLoggedIn={isLoggedIn}
              requireLogin={requireLogin}
            />
          ) : (
            <OrderSquare
              userRole={userRole}
              setUserRole={handleSetUserRole}
              onNavigateToMyOrders={handleNavigateToMyOrders}
              isLoggedIn={isLoggedIn}
              requireLogin={requireLogin}
            />
          )
        )}
        {currentPage === 'order-square' && (
          <OrderSquare
            userRole={userRole}
            setUserRole={handleSetUserRole}
            onNavigateToMyOrders={handleNavigateToMyOrders}
            isLoggedIn={isLoggedIn}
            requireLogin={requireLogin}
          />
        )}
        {currentPage === 'order-publish' && (
          <OrderPublishPage onBack={() => setCurrentPage('order')} />
        )}
        {currentPage === 'myOrders' && (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{borderColor:'var(--border-subtle)',borderTopColor:'var(--brand)'}}/><div className="text-[13px]" style={{color:'var(--text-tertiary)'}}>加载中...</div></div></div>}>
          <MyOrders
            userRole={userRole}
            setUserRole={handleSetUserRole}
            onBack={() => setCurrentPage('order')}
          />
          </Suspense>
        )}
        {currentPage === 'myBills' && (
          <MyBills userRole={userRole} onBack={() => setCurrentPage('order')} onNavigateToMyOrders={handleNavigateToMyOrders} />
        )}
        {currentPage === 'personalInfo' && userInfo && (
          <PersonalInfo
            userInfo={userInfo}
            userRole={userRole === 'customer' || userRole === 'user' ? userRole : null}
            onBack={() => setCurrentPage('order')}
            onUpdate={handleUpdateUserInfo}
            onNavigateToSecurity={handleNavigateToSecurity}
            onNavigateToCustomerProfile={() => setCurrentPage('customerQualification')}
            onNavigateToUserProfile={() => setCurrentPage('userQualification')}
            customerCertStatus={userRole === 'customer' ? customerCertStatus : undefined}
            userCertStatus={userRole === 'user' ? userCertStatus : undefined}
          />
        )}
        {currentPage === 'accountSecurity' && userInfo && (
          <AccountSecurity
            userInfo={userInfo}
            onBack={() => setCurrentPage('personalInfo')}
            onUpdatePhone={handleUpdatePhone}
            onUpdateEmail={handleUpdateEmail}
          />
        )}
        {currentPage === 'customerQualification' && (
          <CustomerQualification
            onBack={() => setCurrentPage('personalInfo')}
            onComplete={() => setCurrentPage('personalInfo')}
            initialCertStatus={customerCertStatus}
            initialData={MOCK_CUSTOMER_CERT_DATA}
            rejectReason={MOCK_CUSTOMER_CERT_REJECT_REASON}
            onCertStatusChange={setCustomerCertStatus}
            verifiedPhone={userInfo?.phone}
            verifiedEmail={userInfo?.email}
          />
        )}
        {currentPage === 'userQualification' && (
          <UserQualification
            onBack={() => setCurrentPage('personalInfo')}
            onComplete={() => setCurrentPage('personalInfo')}
            initialCertStatus={userCertStatus}
            initialData={MOCK_USER_CERT_DATA}
            rejectReason={MOCK_USER_CERT_REJECT_REASON}
            onCertStatusChange={setUserCertStatus}
          />
        )}
        {currentPage === 'messageCenter' && (
          <MessageCenter
            userRole={userRole}
            onBack={() => setCurrentPage('order')}
            onNavigateTo={setCurrentPage}
            onUnreadChange={setUnreadMessageCount}
          />
        )}
        {currentPage === 'operation-dashboard' && (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{borderColor:'var(--border-subtle)',borderTopColor:'var(--brand)'}}/><div className="text-[13px]" style={{color:'var(--text-tertiary)'}}>加载中...</div></div></div>}>
          <OperationDashboard onNavigate={setCurrentPage} />
          </Suspense>
        )}
        {currentPage === 'dev-tool-config' && (
          <DevToolConfig onNavigate={setCurrentPage} />
        )}
        {currentPage === 'agreement-template-config' && (
          <AgreementTemplateConfig onNavigate={setCurrentPage} />
        )}
        {['任务类型管理', '认证标签管理', '其他运营配置'].includes(currentPage) && (
          <OperationConfigPage pageTitle={currentPage} onBack={() => setCurrentPage('operation-dashboard')} />
        )}
        {currentPage === 'adminRegistration' && (
          <AdminRegistration onNavigate={setCurrentPage} />
        )}
        </motion.div>
      </AnimatePresence>
    </div>
    <ToastContainer />
    </>
  );
}