const INDIA_TIME_ZONE = "Asia/Kolkata";

function getIndiaDateTime() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: INDIA_TIME_ZONE,
    })
  );
}

function getNextLunchDeliveryDate() {
  const now = getIndiaDateTime();
  const deliveryDate = new Date(now);

  // Before 11:00 AM → today's lunch
  // 11:00 AM or later → tomorrow's lunch
  if (now.getHours() >= 11) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }

  deliveryDate.setHours(13, 0, 0, 0);

  return deliveryDate;
}

function getDeliveryWindow() {
  return "1:00 PM - 2:00 PM";
}

module.exports = {
  getIndiaDateTime,
  getNextLunchDeliveryDate,
  getDeliveryWindow,
};