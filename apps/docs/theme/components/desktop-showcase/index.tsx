/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useLang, withBase } from '@rspress/core/runtime';

import './index.less';

const latestBuilds = 'https://github.com/bytedance/flowgram.ai/releases/tag/desktop-preview';
const downloadUrl = 'https://github.com/bytedance/flowgram.ai/releases/download/desktop-preview';
const platforms = [
  {
    name: 'macOS',
    architecture: 'Apple Silicon',
    format: '.dmg',
    installer: 'FlowGram_aarch64-apple-darwin.dmg',
  },
  {
    name: 'macOS',
    architecture: 'Intel',
    format: '.dmg',
    installer: 'FlowGram_x86_64-apple-darwin.dmg',
  },
  {
    name: 'Windows',
    architecture: 'x64',
    format: '.exe',
    installer: 'FlowGram_x86_64-pc-windows-msvc-setup.exe',
  },
];

const copy = {
  en: {
    preview: 'DESKTOP PREVIEW',
    title: 'Your ideas. A workflow. Your desktop.',
    description:
      'Meet FlowGram Desktop, a native workspace for macOS and Windows. Build with conversation, refine on the canvas, and turn your workflows into tools.',
    features: ['Build with words', 'See every step', 'Reuse anywhere'],
    video: 'Watch FlowGram Desktop in action',
    duration: '45 seconds · English',
    fallback: 'Watch the product video',
    downloadTitle: 'Bring your next workflow to life.',
    downloadDescription: 'Choose your desktop. Start building.',
    download: 'Download preview',
    latest: 'Latest preview release',
    help: 'How to install',
    instructions:
      'Download the installer directly; no GitHub sign-in is required. Open the .dmg on macOS or run the setup .exe on Windows. Preview installers are unsigned and macOS builds are not notarized. Checksums and build information are available on the release page.',
  },
  zh: {
    preview: '桌面预览版',
    title: '让想法，在桌面上成为工作流。',
    description:
      '认识 FlowGram Desktop，面向 macOS 和 Windows 的原生工作台。用对话搭建，在画布上打磨，让工作流成为随时可用的工具。',
    features: ['用对话搭建', '看清每一步', '在更多地方复用'],
    video: '观看 FlowGram Desktop 产品演示',
    duration: '45 秒 · 英文演示',
    fallback: '观看产品视频',
    downloadTitle: '下一个工作流，从这里开始。',
    downloadDescription: '选择你的桌面平台，开始构建。',
    download: '下载预览版',
    latest: '查看最新预览版',
    help: '安装与下载说明',
    instructions:
      '直接下载安装器，无需登录 GitHub。macOS 打开 .dmg，Windows 运行安装程序 .exe。预览安装包尚未签名，macOS 版本尚未公证。校验和与构建信息可在发布页查看。',
  },
};

export function DesktopShowcase() {
  const lang = useLang() === 'zh' ? 'zh' : 'en';
  const text = copy[lang];
  const video = withBase('/desktop/flowgram-desktop-en.mp4');

  return (
    <section id="desktop" className="desktop-showcase" aria-labelledby="desktop-title">
      <header className="desktop-showcase-header">
        <div className="desktop-showcase-eyebrow">
          <img src={withBase('/flowgram-logo.svg')} width="28" height="28" alt="" />
          <span>FlowGram Desktop</span>
          <span className="desktop-showcase-preview">{text.preview}</span>
        </div>
        <h2 id="desktop-title">{text.title}</h2>
        <p>{text.description}</p>
        <ul className="desktop-showcase-features">
          {text.features.map((feature, index) => (
            <li key={feature}>
              <span aria-hidden="true">0{index + 1}</span>
              {feature}
            </li>
          ))}
        </ul>
      </header>

      <figure className="desktop-showcase-film">
        <video
          controls
          playsInline
          preload="none"
          width="1920"
          height="1080"
          poster={withBase('/desktop/flowgram-desktop-en-poster.jpg')}
          aria-label={text.video}
        >
          <source src={video} type="video/mp4" />
          <track
            kind="captions"
            src={withBase(`/desktop/flowgram-desktop-${lang}.vtt`)}
            srcLang={lang}
            label={lang === 'zh' ? '简体中文' : 'English'}
          />
          <a href={video}>{text.fallback}</a>
        </video>
        <figcaption>
          <span>{text.video}</span>
          <span>{text.duration}</span>
        </figcaption>
      </figure>

      <div className="desktop-showcase-downloads">
        <div className="desktop-showcase-download-heading">
          <div>
            <h3>{text.downloadTitle}</h3>
            <p>{text.downloadDescription}</p>
          </div>
          <a href={latestBuilds} target="_blank" rel="noreferrer">
            {text.latest} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="desktop-showcase-platforms">
          {platforms.map((platform) => (
            <a
              key={platform.installer}
              href={`${downloadUrl}/${platform.installer}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`${text.download} · ${platform.name} ${platform.architecture}`}
            >
              <span>
                <strong>{platform.name}</strong>
                <span className="desktop-showcase-architecture">
                  {platform.architecture} · {platform.format}
                </span>
              </span>
              <span className="desktop-showcase-download-label">
                {text.download} <span aria-hidden="true">↓</span>
              </span>
            </a>
          ))}
        </div>
        <details className="desktop-showcase-help">
          <summary>{text.help}</summary>
          <p>{text.instructions}</p>
        </details>
      </div>
    </section>
  );
}
