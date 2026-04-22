/**
 * main.js — Psychology of Movement
 * "Flow State" Scroll Animation & Kinesthetic Interactions
 * 
 * These interactions are designed around principles of motor learning:
 * - Directional drift mimics eye/body anticipation
 * - Scroll-tied animation creates a proprioceptive feedback loop
 * - Progressive disclosure respects cognitive load theory
 */

(function() {
  'use strict';

  // ---------- CONFIGURATION ----------
  const CONFIG = {
    // Scroll animation thresholds
    scrollDebounceMs: 16, // ~60fps
    animationFrameCount: 48, // Number of frames in swing cycle
    
    // Anticipation hover (based on Quiet Eye research)
    eyeDriftDistance: 8, // px
    bodyDriftDistance: -4, // px
    
    // Intersection Observer threshold for progressive disclosure
    appearThreshold: 0.2,
  };

  // ---------- STATE ----------
  let rafId = null;
  let scrollPercent = 0;
  let animationProgress = 0;
  
  // DOM Elements
  const muybridgeCanvas = document.getElementById('muybridge-swing');
  const muybridgeContainer = document.querySelector('.muybridge-container');
  const articleCards = document.querySelectorAll('.article-card');
  const evidenceModules = document.querySelectorAll('.evidence-module');
  const glossaryTerms = document.querySelectorAll('.glossary-term');

  // ---------- 1. SCROLL-DRIVEN ANIMATION (The "Flow State" Replay Loop) ----------
  /**
   * This ties the scroll position directly to the animation frame.
   * As the user scrolls, they control the "replay" of a golf swing or tennis serve.
   * This creates a kinesthetic learning loop—the user's physical scroll motion
   * is mapped to the athlete's motor execution.
   */
  function initScrollDrivenAnimation() {
    if (!muybridgeCanvas) return;
    
    const ctx = muybridgeCanvas.getContext('2d');
    if (!ctx) return;
    
    // Pre-generate the swing frames (line drawings)
    // In a real implementation, these would be loaded from SVG paths
    // Here we generate procedural frames that simulate a swing arc
    const frames = generateSwingFrames(CONFIG.animationFrameCount);
    
    // Set canvas dimensions
    function resizeCanvas() {
      const container = muybridgeCanvas.parentElement;
      const containerWidth = container.clientWidth;
      muybridgeCanvas.width = containerWidth;
      muybridgeCanvas.height = Math.floor(containerWidth * 0.5); // 2:1 aspect ratio
      drawFrame(frames, Math.floor(animationProgress * (frames.length - 1)));
    }
    
    // Draw a specific frame
    function drawFrame(frameArray, frameIndex) {
      if (!ctx) return;
      
      const frame = frameArray[frameIndex];
      if (!frame) return;
      
      const w = muybridgeCanvas.width;
      const h = muybridgeCanvas.height;
      
      // Clear with warm linen background
      ctx.fillStyle = '#F4EFE6';
      ctx.fillRect(0, 0, w, h);
      
      // Draw subtle grid (biomechanics lab reference)
      ctx.strokeStyle = 'rgba(42, 92, 130, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let i = 0; i < h; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }
      
      // Draw the stick figure / kinematic chain
      ctx.save();
      ctx.translate(w * 0.3, h * 0.7); // Origin at "hip" position
      
      // Draw with "Cobalt Glass" stroke
      ctx.strokeStyle = '#2A5C82';
      ctx.lineWidth = Math.max(2, w * 0.005);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Draw kinematic chain
      frame.limbs.forEach((limb, index) => {
        ctx.beginPath();
        ctx.moveTo(limb.start.x * w, limb.start.y * h);
        ctx.lineTo(limb.end.x * w, limb.end.y * h);
        
        // Fade opacity based on frame (ghosting effect)
        const opacity = 0.3 + (index / frame.limbs.length) * 0.5;
        ctx.strokeStyle = `rgba(42, 92, 130, ${opacity})`;
        ctx.stroke();
      });
      
      // Draw joint markers
      ctx.fillStyle = '#D96C4A';
      frame.joints.forEach(joint => {
        ctx.beginPath();
        ctx.arc(joint.x * w, joint.y * h, w * 0.008, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw the "ball" or "target" with Neural Yellow flash
      if (frame.target) {
        ctx.fillStyle = '#E6A817';
        ctx.beginPath();
        ctx.arc(frame.target.x * w, frame.target.y * h, w * 0.012, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
      
      // Add frame counter (Muybridge style)
      ctx.font = '10px "Courier New", monospace';
      ctx.fillStyle = '#6B6560';
      ctx.fillText(`FRAME ${frameIndex + 1}/${frameArray.length}`, w - 100, h - 15);
    }
    
    // Generate procedural swing frames
    function generateSwingFrames(count) {
      const frames = [];
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1); // 0 to 1
        
        // Swing arc parameters
        const armAngle = -0.8 + t * 2.4; // Radians
        const clubAngle = armAngle + 0.3 * Math.sin(t * Math.PI);
        
        // Shoulder position (relative to origin)
        const shoulderX = -0.05;
        const shoulderY = -0.15;
        
        // Hand position
        const handX = shoulderX + 0.15 * Math.cos(armAngle);
        const handY = shoulderY + 0.15 * Math.sin(armAngle);
        
        // Club head position
        const clubLength = 0.2;
        const clubHeadX = handX + clubLength * Math.cos(clubAngle);
        const clubHeadY = handY + clubLength * Math.sin(clubAngle);
        
        // Target (ball) position
        const targetX = 0.25;
        const targetY = 0.05;
        
        frames.push({
          limbs: [
            { start: { x: shoulderX, y: shoulderY }, end: { x: handX, y: handY } },
            { start: { x: handX, y: handY }, end: { x: clubHeadX, y: clubHeadY } },
            { start: { x: -0.1, y: 0.1 }, end: { x: shoulderX, y: shoulderY } }, // torso
          ],
          joints: [
            { x: shoulderX, y: shoulderY },
            { x: handX, y: handY },
            { x: clubHeadX, y: clubHeadY },
          ],
          target: { x: targetX, y: targetY },
        });
      }
      return frames;
    }
    
    // Scroll handler
    function handleScroll() {
      if (!muybridgeContainer) return;
      
      const rect = muybridgeContainer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the container is through the viewport
      const startOffset = windowHeight * 0.8;
      const endOffset = windowHeight * 0.2;
      
      let progress = (startOffset - rect.top) / (startOffset - endOffset);
      progress = Math.max(0, Math.min(1, progress));
      
      animationProgress = progress;
      
      // Update canvas
      if (muybridgeCanvas && frames) {
        const frameIndex = Math.floor(animationProgress * (frames.length - 1));
        drawFrame(frames, frameIndex);
      }
    }
    
    // Initialize
    window.addEventListener('resize', () => {
      resizeCanvas();
      handleScroll();
    });
    
    window.addEventListener('scroll', () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    });
    
    resizeCanvas();
    handleScroll();
  }

  // ---------- 2. ANTICIPATION HOVER (Directional Drift) ----------
  /**
   * Based on "Quiet Eye" research in motor learning.
   * The image drifts right (eye tracking the target) while text drifts left (body anticipation).
   * This creates a subtle kinesthetic cue that feels like preparing for a movement.
   */
  function initAnticipationHover() {
    articleCards.forEach(card => {
      const image = card.querySelector('.card-image');
      const content = card.querySelector('.card-content');
      
      if (!image || !content) return;
      
      // Apply the drift values from config
      card.addEventListener('mouseenter', () => {
        image.style.transform = `translateX(${CONFIG.eyeDriftDistance}px)`;
        content.style.transform = `translateX(${CONFIG.bodyDriftDistance}px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        image.style.transform = 'translateX(0)';
        content.style.transform = 'translateX(0)';
      });
    });
  }

  // ---------- 3. PROGRESSIVE DISCLOSURE (Respecting Cognitive Load) ----------
  /**
   * Evidence modules and glossary items fade in as they enter viewport.
   * This prevents cognitive overwhelm and respects the "chunking" principle of learning.
   */
  function initProgressiveDisclosure() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.appearThreshold,
      rootMargin: '20px 0px',
    });
    
    // Observe evidence modules
    evidenceModules.forEach(module => {
      module.style.opacity = '0';
      module.style.transform = 'translateY(12px)';
      module.style.transition = 'opacity 500ms var(--ease-out-expo), transform 500ms var(--ease-out-expo)';
      observer.observe(module);
    });
    
    // Observe glossary items individually for staggered effect
    const glossaryItems = document.querySelectorAll('.glossary-item');
    glossaryItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-8px)';
      item.style.transition = `opacity 400ms var(--ease-out-expo) ${index * 30}ms, transform 400ms var(--ease-out-expo) ${index * 30}ms`;
      observer.observe(item);
    });
  }

  // ---------- 4. CITATION TOOLTIPS (PubMed/DOI Integration) ----------
  /**
   * Superscript citations show a tooltip with the reference.
   * This keeps the design clean while providing immediate access to evidence.
   */
  function initCitationTooltips() {
    const citations = document.querySelectorAll('sup a');
    
    citations.forEach(citation => {
      // In a real implementation, this would fetch from a data attribute
      const refId = citation.getAttribute('href')?.replace('#ref-', '');
      if (!refId) return;
      
      const refElement = document.getElementById(`ref-${refId}`);
      if (!refElement) return;
      
      const refText = refElement.textContent || '';
      
      citation.setAttribute('title', refText.substring(0, 150) + '…');
      citation.setAttribute('aria-label', `Citation: ${refText}`);
    });
  }

  // ---------- 5. GLOSSARY INTERACTION (Coach's Field Reference) ----------
  /**
   * Clicking a glossary term scrolls to the relevant section in the article.
   * This reinforces the connection between definition and application.
   */
  function initGlossaryLinking() {
    glossaryTerms.forEach(term => {
      term.addEventListener('click', (e) => {
        const targetId = term.dataset.target;
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          
          // Brief highlight pulse
          targetElement.style.transition = 'background 300ms';
          targetElement.style.background = 'rgba(230, 168, 23, 0.08)';
          setTimeout(() => {
            targetElement.style.background = '';
          }, 500);
        }
      });
      
      // Add pointer cursor to indicate interactivity
      term.style.cursor = 'pointer';
    });
  }

  // ---------- 6. DATA TABLE ROW HIGHLIGHT (Fitts' Law Visualization) ----------
  /**
   * Tables showing stage dynamics highlight relevant neural systems on hover.
   */
  function initTableInteractions() {
    const tables = document.querySelectorAll('.data-table');
    
    tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      
      rows.forEach(row => {
        row.addEventListener('mouseenter', () => {
          // Highlight the corresponding level in the legend/sidebar
          const stageName = row.cells[0]?.textContent?.trim();
          if (!stageName) return;
          
          // Dispatch a custom event that other components can listen for
          window.dispatchEvent(new CustomEvent('stage-hover', {
            detail: { stage: stageName }
          }));
        });
        
        row.addEventListener('mouseleave', () => {
          window.dispatchEvent(new CustomEvent('stage-hover', {
            detail: { stage: null }
          }));
        });
      });
    });
  }

  // ---------- 7. KINEMATIC HOVER EFFECT (Fine Motor Control) ----------
  /**
   * Small micro-interaction: buttons have a subtle "press" that mimics
   * the slight resistance of a well-weighted implement.
   */
  function initButtonFeedback() {
    const buttons = document.querySelectorAll('.button');
    
    buttons.forEach(button => {
      button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(0.98)';
      });
      
      button.addEventListener('mouseup', () => {
        button.style.transform = '';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
      });
    });
  }

  // ---------- 8. RESPONSIVE CANVAS HANDLING ----------
  function initResponsiveCanvas() {
    // Re-run scroll animation on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        if (muybridgeCanvas) {
          const event = new Event('scroll');
          window.dispatchEvent(event);
        }
      }, 100);
    });
  }

  // ---------- INITIALIZATION ----------
  function init() {
    initScrollDrivenAnimation();
    initAnticipationHover();
    initProgressiveDisclosure();
    initCitationTooltips();
    initGlossaryLinking();
    initTableInteractions();
    initButtonFeedback();
    initResponsiveCanvas();
    
    // Mark as initialized
    document.documentElement.classList.add('js-loaded');
    console.log('🧠 Psychology of Movement — Organic Precision system active');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();