<template>
  <div class="not-found-container">
    <div class="not-found">
      <h1>404 - Not authorized</h1>
      <p>This page doesn't exist or you are not authorized to enter.</p>
      <a href="/">Go Back</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFound"
};
</script>

<style scoped>
.not-found-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
}

.not-found {
  text-align: center;
  max-width: 90%;
  padding: 1rem;
  border-radius: 8px;
}
.not-found a {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.6rem 1.5rem;
  background-color: #80693e;
  color: white;
  text-decoration: none;
  font-weight: 500;
  border-radius: 6px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.not-found a:hover {
  background-color: #4f3e18;
  transform: translateY(-2px);
}
</style>

