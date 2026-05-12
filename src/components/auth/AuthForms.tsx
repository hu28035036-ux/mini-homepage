'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Label, ErrorText, Card } from '@/components/ui/primitives';

type ApiResult = { success: boolean; data?: unknown; error_code?: string; message?: string };

async function post(url: string, body: unknown): Promise<ApiResult> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const r = await post('/api/auth/login', { email, password });
    setLoading(false);
    if (!r.success) {
      setErr(r.message ?? '로그인 실패');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <Card className="max-w-md w-full">
      <h1 className="text-xl font-bold mb-6">로그인</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">비밀번호</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {err && <ErrorText>{err}</ErrorText>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? '확인 중...' : '로그인'}
        </Button>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">
        아직 계정이 없나요?{' '}
        <Link href="/signup" className="text-violet-600 font-medium">
          회원가입
        </Link>
      </p>
    </Card>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    if (password !== passwordConfirm) {
      setErr('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    const r = await post('/api/auth/signup', { email, password, nickname });
    setLoading(false);
    if (!r.success) {
      setErr(r.message ?? '가입 실패');
      return;
    }
    router.push('/login');
  }

  return (
    <Card className="max-w-md w-full">
      <h1 className="text-xl font-bold mb-6">회원가입</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">비밀번호 (8자 이상)</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        <div>
          <Label htmlFor="password2">비밀번호 확인</Label>
          <Input id="password2" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required minLength={8} />
        </div>
        <div>
          <Label htmlFor="nickname">닉네임</Label>
          <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} required maxLength={30} />
        </div>
        {err && <ErrorText>{err}</ErrorText>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? '처리 중...' : '가입하기'}
        </Button>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">
        이미 가입했나요?{' '}
        <Link href="/login" className="text-violet-600 font-medium">
          로그인
        </Link>
      </p>
    </Card>
  );
}
