import { NextResponse, type NextRequest } from "next/server";

function isSuspiciousRequest(request: NextRequest) {
  const userAgent = (request.headers.get("user-agent") ?? "").toLowerCase();
  const { searchParams } = request.nextUrl;

  if (userAgent.includes("whatcms")) {
    return true;
  }

  if (searchParams.has("LSCWP_CTRL") || searchParams.has("lscwp_ctrl")) {
    return true;
  }

  if (userAgent.includes("headlesschrome") && searchParams.has("_rsc")) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  if (isSuspiciousRequest(request)) {
    return new NextResponse("Blocked", {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|robots.txt|sitemap.xml).*)"],
};

