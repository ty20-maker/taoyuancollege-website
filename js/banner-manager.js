// 全域 Banner 管理系統 - 解決換頁後 Banner 失效問題

window.BannerManager = (function() {
    let currentSlide = 0;
    let totalSlides = 0;
    let slideInterval = null;
    let carousel = null;
    let slides = [];
    let indicators = [];
    let prevBtn = null;
    let nextBtn = null;
    let isTransitioning = false;

    // 初始化 Banner
    function init() {
        console.log('🎯 Banner Manager: 初始化開始');
        
        // 清理之前的實例
        cleanup();
        
        // 查找 Banner 元素
        carousel = document.getElementById('bannerCarousel') || document.querySelector('.banner-carousel');
        
        if (!carousel) {
            console.log('⚠️ Banner Manager: 找不到 Banner 容器');
            return false;
        }

        // 取得所有元素
        slides = Array.from(carousel.querySelectorAll('.banner-carousel__slide'));
        indicators = Array.from(carousel.querySelectorAll('.banner-carousel__indicator'));
        prevBtn = carousel.querySelector('.banner-carousel__btn--prev');
        nextBtn = carousel.querySelector('.banner-carousel__btn--next');
        
        totalSlides = slides.length;
        currentSlide = 0;
        
        console.log(`✅ Banner Manager: 找到 ${totalSlides} 個幻燈片`);
        
        if (totalSlides <= 1) {
            console.log('ℹ️ Banner Manager: 只有一個幻燈片，不啟用輪播功能');
            return true;
        }

        // 初始化狀態
        initializeSlides();
        
        // 綁定事件
        bindEvents();
        
        // 啟動自動輪播
        startAutoSlide();
        
        console.log('🎉 Banner Manager: 初始化完成');
        return true;
    }

    // 初始化幻燈片狀態
    function initializeSlides() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'fade-out');
            if (index === 0) {
                slide.classList.add('active');
                slide.style.opacity = '1';
                slide.style.visibility = 'visible';
            } else {
                slide.style.opacity = '0';
                slide.style.visibility = 'hidden';
            }
        });

        indicators.forEach((indicator, index) => {
            indicator.classList.remove('active');
            if (index === 0) {
                indicator.classList.add('active');
            }
        });
    }

    // 綁定事件監聽器
    function bindEvents() {
        // 上一張按鈕
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }

        // 下一張按鈕
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }

        // 指示器點擊
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
            });
        });

        // 滑鼠懸停時暫停自動輪播
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoSlide);
            carousel.addEventListener('mouseleave', startAutoSlide);
        }

        // 鍵盤導航
        document.addEventListener('keydown', handleKeydown);
        
        // 頁面可見性變化
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // 顯示指定幻燈片
    function showSlide(index) {
        if (index === currentSlide || isTransitioning || !slides[index]) {
            return;
        }

        console.log(`🔄 Banner Manager: 切換到幻燈片 ${index + 1}`);
        
        isTransitioning = true;
        
        const currentSlideElement = slides[currentSlide];
        const nextSlideElement = slides[index];

        // 準備下一張圖片
        nextSlideElement.style.visibility = 'visible';
        nextSlideElement.style.opacity = '0';
        
        // 使用 requestAnimationFrame 確保樣式已應用
        requestAnimationFrame(() => {
            // 淡入新圖片
            nextSlideElement.classList.add('active');
            nextSlideElement.style.opacity = '1';
            
            // 淡出當前圖片
            if (currentSlideElement) {
                currentSlideElement.classList.add('fade-out');
                currentSlideElement.style.opacity = '0';
            }
            
            // 更新指示器
            updateIndicators(index);
            
            // 清理過渡狀態
            setTimeout(() => {
                slides.forEach(slide => {
                    slide.classList.remove('active', 'fade-out');
                    slide.style.visibility = 'hidden';
                    slide.style.opacity = '0';
                });
                
                // 確保目標幻燈片是顯示狀態
                nextSlideElement.classList.add('active');
                nextSlideElement.style.visibility = 'visible';
                nextSlideElement.style.opacity = '1';
                
                currentSlide = index;
                isTransitioning = false;
                
                console.log(`✅ Banner Manager: 已切換到幻燈片 ${index + 1}`);
            }, 800); // 配合CSS過渡時間
        });
    }

    // 更新指示器狀態
    function updateIndicators(activeIndex) {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === activeIndex);
        });
    }

    // 下一張
    function nextSlide() {
        const next = (currentSlide + 1) % totalSlides;
        showSlide(next);
    }

    // 上一張
    function prevSlide() {
        const prev = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(prev);
    }

    // 開始自動輪播
    function startAutoSlide() {
        if (totalSlides > 1 && !slideInterval) {
            slideInterval = setInterval(() => {
                if (!isTransitioning && !document.hidden) {
                    nextSlide();
                }
            }, 5000);
            console.log('▶️ Banner Manager: 自動輪播已啟動');
        }
    }

    // 停止自動輪播
    function stopAutoSlide() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
            console.log('⏸️ Banner Manager: 自動輪播已暫停');
        }
    }

    // 鍵盤事件處理
    function handleKeydown(e) {
        if (!carousel || totalSlides <= 1) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSlide();
                break;
        }
    }

    // 頁面可見性變化處理
    function handleVisibilityChange() {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    }

    // 清理資源
    function cleanup() {
        console.log('🧹 Banner Manager: 清理中...');
        
        stopAutoSlide();
        
        // 移除事件監聽器
        if (prevBtn) {
            prevBtn.removeEventListener('click', prevSlide);
        }
        if (nextBtn) {
            nextBtn.removeEventListener('click', nextSlide);
        }
        
        indicators.forEach((indicator, index) => {
            indicator.removeEventListener('click', () => showSlide(index));
        });
        
        if (carousel) {
            carousel.removeEventListener('mouseenter', stopAutoSlide);
            carousel.removeEventListener('mouseleave', startAutoSlide);
        }
        
        // 重置變數
        currentSlide = 0;
        totalSlides = 0;
        carousel = null;
        slides = [];
        indicators = [];
        prevBtn = null;
        nextBtn = null;
        isTransitioning = false;
    }

    // 強制重新初始化
    function reinitialize() {
        console.log('🔄 Banner Manager: 強制重新初始化');
        cleanup();
        
        // 稍微延遲以確保DOM已準備好
        setTimeout(() => {
            init();
        }, 100);
    }

    // 檢查 Banner 健康狀態
    function healthCheck() {
        const isHealthy = !!(
            carousel && 
            slides.length > 0 && 
            (totalSlides <= 1 || slideInterval !== null)
        );
        
        console.log(`🏥 Banner Manager: 健康狀態 ${isHealthy ? '✅ 正常' : '❌ 異常'}`);
        return isHealthy;
    }

    // 公開介面
    return {
        init: init,
        cleanup: cleanup,
        reinitialize: reinitialize,
        healthCheck: healthCheck,
        nextSlide: nextSlide,
        prevSlide: prevSlide,
        showSlide: showSlide,
        startAutoSlide: startAutoSlide,
        stopAutoSlide: stopAutoSlide
    };
})();

// 自動初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM 載入完成，初始化 Banner Manager');
    window.BannerManager.init();
});

// 處理頁面換頁後的重新初始化
window.addEventListener('load', function() {
    console.log('🚀 頁面完全載入，檢查 Banner Manager');
    
    // 延遲檢查以確保所有資源都已載入
    setTimeout(() => {
        if (!window.BannerManager.healthCheck()) {
            console.log('🔧 Banner Manager 狀態異常，重新初始化');
            window.BannerManager.reinitialize();
        }
    }, 500);
});

// 處理瀏覽器前進/後退
window.addEventListener('pageshow', function(event) {
    console.log('📖 頁面顯示事件觸發');
    
    // 如果是從 bfcache 載入（瀏覽器快取）
    if (event.persisted) {
        console.log('💾 從瀏覽器快取載入，重新初始化 Banner');
        window.BannerManager.reinitialize();
    }
});

// 全域錯誤處理
window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('banner')) {
        console.error('🚨 Banner 相關錯誤:', e.error);
        // 嘗試重新初始化
        setTimeout(() => {
            window.BannerManager.reinitialize();
        }, 1000);
    }
});

console.log('✨ Banner Manager 全域腳本已載入');