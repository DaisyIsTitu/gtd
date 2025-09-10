/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // TypeScript 에러가 있어도 빌드를 계속 진행 (개발 단계에서만)
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint 에러가 있어도 빌드를 계속 진행 (개발 단계에서만)
    ignoreDuringBuilds: false,
  },
  // 이미지 최적화 설정
  images: {
    domains: ['lh3.googleusercontent.com'], // Google 프로필 이미지용
  },
  // 환경 변수 설정
  env: {
    CUSTOM_KEY: 'my-value',
  },
};

module.exports = nextConfig;