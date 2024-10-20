<script lang="ts">
    export let message = "Loading..."; // Message to display during loading
  </script>
  
  <style>
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8); /* Overlay color */
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000; /* Ensure it's on top */
      font-size: 3rem; /* Adjust font size */
    }
  
    h2 {
      margin: 0;
      animation: fadeIn 1s ease-in-out; /* Add animation for appearance */
    }
  
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
  
  <div class="overlay">
    <h2 class="text-[#d4be76] font-bold">{message}</h2> <!-- Display the loading message -->
  </div>
  