// import { auth } from "@/lib/auth";
// import type { NextRequest } from "next/server";

// export function proxy(request: NextRequest) {
//   return auth(request);
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };

import { auth } from "@/lib/auth";

export const proxy = auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
