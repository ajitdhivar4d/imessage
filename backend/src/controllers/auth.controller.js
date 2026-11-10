export async function checkAuth(req, res) {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("CheckAuth error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}
