export const userBookingEmail = ({
    userName,
    hotelName,
    location,
    address,
    roomType,
    rooms,
    bookingId,
    paymentId,
    paymentStatus,
    hotelPhone,
    hotelEmail,
    supportPhone,
    supportEmail,
    bookingDate,
    checkIn,
    checkInTime,
    checkOut,
    checkOutTime,
    guests,
    totalPrice,
    latitude,
    longitude,
  }) => {
    const mapsLink =
      latitude && longitude
        ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            address || location || hotelName
          )}`;
  
    return `<!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background-color:#f4f4f7; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
  
            <!-- Header / Logo -->
            <tr>
              <td style="background:#0f172a; padding:28px 32px;">
                <table width="100%">
                  <tr>
                    <td>
                      <span style="color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">
                        🏨 Haven<span style="color:#facc15;">Co</span>
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
  
            <!-- Success banner -->
            <tr>
              <td style="background:#16a34a; padding:16px 32px;">
                <span style="color:#ffffff; font-size:16px; font-weight:600;">
                  ✅ Payment Successful — Booking Confirmed
                </span>
              </td>
            </tr>
  
            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                <p style="font-size:16px; color:#1f2937; margin:0 0 8px;">Hi ${userName || "Guest"},</p>
                <p style="font-size:14px; color:#4b5563; margin:0 0 24px;">
                  Your booking is confirmed! Here are your stay details:
                </p>
  
                <!-- Hotel & Location -->
                <table width="100%" style="border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; margin-bottom:16px;">
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280; width:40%;">Hotel</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${hotelName}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280; vertical-align:top;">Address</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">
                      ${address || location}
                      <div style="margin-top:8px;">
                        <a href="${mapsLink}" target="_blank" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-size:12px; font-weight:600; padding:8px 14px; border-radius:6px;">
                          📍 Open in Google Maps
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
  
                <!-- Booking Info -->
                <table width="100%" style="border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; margin-bottom:16px;">
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280; width:40%;">Booking ID</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${bookingId}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Payment ID</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${paymentId}</td>
                  </tr>
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Payment Status</td>
                    <td style="padding:14px 20px; font-size:14px; color:#16a34a; font-weight:700;">${paymentStatus || "Paid"}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Booking Date</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${bookingDate}</td>
                  </tr>
                </table>
  
                <!-- Stay Info -->
                <table width="100%" style="border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; margin-bottom:16px;">
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280; width:40%;">Room Type</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${roomType}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Rooms</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${rooms}</td>
                  </tr>
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Guests</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${guests}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Check-in</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${checkIn}${checkInTime ? ` • ${checkInTime}` : ""}</td>
                  </tr>
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Check-out</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${checkOut}${checkOutTime ? ` • ${checkOutTime}` : ""}</td>
                  </tr>
                </table>
  
                <!-- Total Paid -->
                <table width="100%" style="background:#0f172a; border-radius:10px; margin-bottom:16px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <span style="color:#cbd5e1; font-size:14px;">Total Paid</span>
                      <div style="color:#ffffff; font-size:26px; font-weight:700; margin-top:4px;">₹${totalPrice}</div>
                    </td>
                  </tr>
                </table>
  
                <!-- Contact Info -->
                <table width="100%" style="border:1px solid #e5e7eb; border-radius:10px; overflow:hidden;">
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280; width:40%;">Hotel Contact</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${hotelPhone}</td>
                  </tr>
                  ${
                    hotelEmail
                      ? `<tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Hotel Email</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${hotelEmail}</td>
                  </tr>`
                      : ""
                  }
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Support</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">
                      ${supportPhone || ""}${supportPhone && supportEmail ? " • " : ""}${supportEmail || ""}
                    </td>
                  </tr>
                </table>
  
                <p style="font-size:13px; color:#9ca3af; margin-top:28px;">
                  Thank you for booking with HavenCo. Have a great stay!
                </p>
              </td>
            </tr>
  
            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb; padding:20px 32px; text-align:center;">
                <span style="font-size:12px; color:#9ca3af;">© ${new Date().getFullYear()} HavenCo. All rights reserved.</span>
              </td>
            </tr>
  
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  };
  
  export const managerBookingEmail = ({
    hotelName,
    address,
    guestName,
    guestEmail,
    guestPhone,
    bookingId,
    paymentId,
    roomType,
    rooms,
    checkIn,
    checkInTime,
    checkOut,
    checkOutTime,
    guests,
    totalPrice,
    bookingDate,
    latitude,
    longitude,
  }) => {
    const mapsLink =
      latitude && longitude
        ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            address || hotelName
          )}`;
  
    return `<!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background-color:#f4f4f7; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
  
            <tr>
              <td style="background:#0f172a; padding:28px 32px;">
                <span style="color:#ffffff; font-size:22px; font-weight:700;">
                  🏨 Haven<span style="color:#facc15;">Co</span>
                </span>
                <span style="float:right; color:#94a3b8; font-size:12px; margin-top:6px;">Manager Dashboard</span>
              </td>
            </tr>
  
            <tr>
              <td style="background:#2563eb; padding:16px 32px;">
                <span style="color:#ffffff; font-size:16px; font-weight:600;">
                  🔔 New Booking Request Received
                </span>
              </td>
            </tr>
  
            <tr>
              <td style="padding:32px;">
                <p style="font-size:14px; color:#4b5563; margin:0 0 24px;">
                  A new booking has been confirmed for your property. Please prepare accordingly.
                </p>
  
                <!-- Guest Info -->
                <p style="font-size:12px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px; font-weight:700;">Guest Details</p>
                <table width="100%" style="border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; margin-bottom:20px;">
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280; width:40%;">Name</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${guestName}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Email</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${guestEmail}</td>
                  </tr>
                  ${
                    guestPhone
                      ? `<tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Phone</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${guestPhone}</td>
                  </tr>`
                      : ""
                  }
                </table>
  
                <!-- Booking Info -->
                <p style="font-size:12px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px; font-weight:700;">Booking Details</p>
                <table width="100%" style="border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; margin-bottom:20px;">
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280; width:40%;">Hotel</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${hotelName}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Booking ID</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${bookingId}</td>
                  </tr>
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Payment ID</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${paymentId}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Room Type</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${roomType}</td>
                  </tr>
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Rooms</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${rooms}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Guests</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${guests}</td>
                  </tr>
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Check-in</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${checkIn}${checkInTime ? ` • ${checkInTime}` : ""}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Check-out</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${checkOut}${checkOutTime ? ` • ${checkOutTime}` : ""}</td>
                  </tr>
                  <tr style="background:#f9fafb;">
                    <td style="padding:14px 20px; font-size:14px; color:#6b7280;">Booking Date</td>
                    <td style="padding:14px 20px; font-size:14px; color:#111827; font-weight:600;">${bookingDate}</td>
                  </tr>
                </table>
  
                <!-- Amount -->
                <table width="100%" style="background:#0f172a; border-radius:10px; margin-bottom:20px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <span style="color:#cbd5e1; font-size:14px;">Amount Received</span>
                      <div style="color:#ffffff; font-size:26px; font-weight:700; margin-top:4px;">₹${totalPrice}</div>
                    </td>
                  </tr>
                </table>
  
                ${
                  address
                    ? `<a href="${mapsLink}" target="_blank" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-size:13px; font-weight:600; padding:10px 18px; border-radius:6px; margin-bottom:20px;">
                  📍 View Property Location
                </a><br/>`
                    : ""
                }
  
                <p style="font-size:13px; color:#9ca3af; margin-top:20px;">
                  Please prepare for the guest's arrival. You can manage this booking from your HavenCo dashboard.
                </p>
              </td>
            </tr>
  
            <tr>
              <td style="background:#f9fafb; padding:20px 32px; text-align:center;">
                <span style="font-size:12px; color:#9ca3af;">© ${new Date().getFullYear()} HavenCo. All rights reserved.</span>
              </td>
            </tr>
  
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  };