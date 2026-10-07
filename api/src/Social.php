<?php
// Sign-in with another provider (Apple, Google, Facebook ...): the seam, ready for providers to be added one
// file at a time. NO provider is switched on today, so POST /auth/social answers "not available" for all of
// them. To add one, write a class implementing SocialVerifier, register it in Social::PROVIDERS, and enable it
// in the private config (see documentation/ACCOUNTS_AND_SIGN_IN.md). Nothing else needs to change: accounts
// are keyed by email address, and a provider only proves "this is the person who owns this address".
if (!defined('UO_API')) { exit; }

interface SocialVerifier
{
    /**
     * Check the identity token the app received from the provider (signature, issuer, audience, expiry).
     * @return array{subject:string, email:string, email_verified:bool}|null  null when the token is not genuine
     */
    public function verify(string $idToken): ?array;
}

final class Social
{
    /** provider name => class name. Add a line here when a verifier is written. */
    private const PROVIDERS = [
        // 'google'   => 'GoogleVerifier',
        // 'apple'    => 'AppleVerifier',
        // 'facebook' => 'FacebookVerifier',
    ];

    /** Extra providers registered at run time (used by the tests to prove the seam works). */
    private static array $extra = [];

    public static function register(string $name, SocialVerifier $verifier): void { self::$extra[$name] = $verifier; }
    public static function reset(): void { self::$extra = []; }

    /** The verifier for $name, or null when that provider is unknown or not switched on (config social.<name>.enabled). */
    public static function verifier($name): ?SocialVerifier
    {
        if (!is_string($name) || preg_match('/^[a-z]{3,20}$/', $name) !== 1) { return null; }
        if (isset(self::$extra[$name])) { return self::$extra[$name]; }
        if (!isset(self::PROVIDERS[$name]) || Config::get("social.$name.enabled") !== true) { return null; }
        $class = self::PROVIDERS[$name];
        return class_exists($class) ? new $class() : null;
    }
}
