// Route to intentionally trigger a 500 error
router.get(
  "/trigger-error",
  utilities.handleErrors(async (req, res) => {
    // Force a 500 error
    throw new Error("Intentional 500 error for testing");
  })
);
