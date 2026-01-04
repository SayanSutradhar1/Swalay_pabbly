export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="prose prose-gray max-w-none">
                <p className="mb-4">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
                <p className="mb-4">
                    At Swalay, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
                <p className="mb-4">
                    We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
                <p className="mb-4">
                    We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Security</h2>
                <p className="mb-4">
                    We implement appropriate technical and organizational measures to protect the security of your personal information.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">4. Contact Us</h2>
                <p className="mb-4">
                    If you have any questions about this Privacy Policy, please contact us at support@swalay.com.
                </p>
            </div>
        </div>
    );
}
