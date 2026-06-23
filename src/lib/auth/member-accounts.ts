import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMemberSession } from "@/lib/auth/member-session";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 10;

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function generateRecoveryCode() {
  return randomBytes(6).toString("hex").toUpperCase();
}

export async function signUpMember(input: {
  displayName: string;
  username: string;
  pin: string;
  inviteCode: string;
}) {
  if (!process.env.MEMBER_INVITE_CODE || input.inviteCode !== process.env.MEMBER_INVITE_CODE) {
    return { kind: "invalid_invite" as const };
  }

  const db = createAdminClient();
  const username = normalizeUsername(input.username);
  const { data: existing } = await db
    .from("member_accounts")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existing) return { kind: "username_taken" as const };

  const recoveryCode = generateRecoveryCode();
  const [pinHash, recoveryCodeHash] = await Promise.all([
    bcrypt.hash(input.pin, 12),
    bcrypt.hash(recoveryCode, 12),
  ]);

  const { data: member, error: memberError } = await db
    .from("members")
    .insert({ display_name: input.displayName.trim(), sort_order: 999 })
    .select("id,display_name")
    .single();
  if (memberError) throw memberError;

  const { data: account, error: accountError } = await db
    .from("member_accounts")
    .insert({
      member_id: member.id,
      username,
      pin_hash: pinHash,
      recovery_code_hash: recoveryCodeHash,
    })
    .select("id")
    .single();
  if (accountError) {
    await db.from("members").delete().eq("id", member.id);
    throw accountError;
  }

  await createMemberSession({
    accountId: account.id,
    memberId: member.id,
    username,
    displayName: member.display_name,
    role: "customer",
  });
  return { kind: "created" as const, recoveryCode };
}

export async function loginMember(usernameInput: string, pin: string) {
  const db = createAdminClient();
  const username = normalizeUsername(usernameInput);
  const { data: account } = await db
    .from("member_accounts")
    .select("id,member_id,username,pin_hash,failed_attempts,locked_until,role,members(display_name)")
    .eq("username", username)
    .maybeSingle();
  if (!account) return { kind: "invalid" as const };

  if (account.locked_until && new Date(account.locked_until).getTime() > Date.now()) {
    return { kind: "locked" as const };
  }

  const valid = await bcrypt.compare(pin, account.pin_hash);
  if (!valid) {
    const attempts = account.failed_attempts + 1;
    await db.from("member_accounts").update({
      failed_attempts: attempts >= MAX_ATTEMPTS ? 0 : attempts,
      locked_until: attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString()
        : null,
    }).eq("id", account.id);
    return { kind: "invalid" as const };
  }

  await db.from("member_accounts").update({ failed_attempts: 0, locked_until: null }).eq("id", account.id);
  const member = Array.isArray(account.members) ? account.members[0] : account.members;
  const displayName = member?.display_name ?? username;
  await createMemberSession({
    accountId: account.id,
    memberId: account.member_id,
    username,
    displayName,
    role: account.role,
  });
  return { kind: "authenticated" as const };
}

export async function resetPinWithRecovery(usernameInput: string, recoveryCode: string, newPin: string) {
  const db = createAdminClient();
  const username = normalizeUsername(usernameInput);
  const { data: account } = await db
    .from("member_accounts")
    .select("id,recovery_code_hash")
    .eq("username", username)
    .maybeSingle();
  if (!account || !(await bcrypt.compare(recoveryCode.trim().toUpperCase(), account.recovery_code_hash))) {
    return { kind: "invalid" as const };
  }

  const nextRecoveryCode = generateRecoveryCode();
  const [pinHash, recoveryCodeHash] = await Promise.all([
    bcrypt.hash(newPin, 12),
    bcrypt.hash(nextRecoveryCode, 12),
  ]);
  await db.from("member_accounts").update({
    pin_hash: pinHash,
    recovery_code_hash: recoveryCodeHash,
    failed_attempts: 0,
    locked_until: null,
    updated_at: new Date().toISOString(),
  }).eq("id", account.id);
  return { kind: "reset" as const, recoveryCode: nextRecoveryCode };
}
