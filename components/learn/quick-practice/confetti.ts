export const CONFETTI_STYLES = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(-100%) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  .confetti-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .confetti {
    position: absolute;
    width: 8px;
    height: 8px;
    animation: confetti-fall 3s linear infinite;
    opacity: 0;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`;
