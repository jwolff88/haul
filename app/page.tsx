import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Truck, Clock, Shield, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-2xl font-black text-orange-500 tracking-tight">HAUL</span>
        <div className="flex gap-3">
          <Button variant="ghost" render={<Link href="/sign-in" />}>
            Sign In
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" render={<Link href="/sign-up" />}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <div className="inline-block bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full mb-6">
          Now serving Butte, Montana
        </div>
        <h1 className="text-5xl font-black text-gray-900 leading-tight mb-6">
          Need something moved?<br />
          <span className="text-orange-500">We&apos;ve got a truck.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
          Post a haul job in 60 seconds. A local driver with a truck shows up same day.
          No moving company. No Uhaul hassle.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white text-lg h-14 px-8"
            render={<Link href="/post-job" />}
          >
            Post a Haul Job →
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg h-14 px-8 border-gray-300"
            render={<Link href="/sign-up?role=driver" />}
          >
            Drive &amp; Earn
          </Button>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">What people haul</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { emoji: "🛋️", label: "Facebook Marketplace finds" },
              { emoji: "🪵", label: "Building materials" },
              { emoji: "🚜", label: "Farm & ranch supplies" },
              { emoji: "🗑️", label: "Job site debris" },
              { emoji: "🏍️", label: "ATVs & equipment" },
              { emoji: "📦", label: "Moving furniture" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 text-center shadow-sm border">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="text-sm font-medium text-gray-700">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { icon: <Clock className="w-8 h-8 text-orange-500" />, step: "1", title: "Post in 60 seconds", desc: "Describe what you need moved, set your price, add pickup and dropoff." },
            { icon: <Truck className="w-8 h-8 text-orange-500" />, step: "2", title: "Driver accepts", desc: "A local driver with a truck sees your job and accepts it. Real-time notification." },
            { icon: <Shield className="w-8 h-8 text-orange-500" />, step: "3", title: "Pay securely", desc: "Payment held in escrow. Released to driver after you confirm job is done." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Driver CTA */}
      <section className="bg-gray-900 text-white px-6 py-16 text-center">
        <Truck className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-3xl font-black mb-4">Got a truck? Start earning.</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Keep 85% of every job. Set your own hours. Butte drivers are making real money hauling for their neighbors.
        </p>
        <Button
          size="lg"
          className="bg-orange-500 hover:bg-orange-600 text-white text-lg h-14 px-8"
          render={<Link href="/sign-up?role=driver" />}
        >
          Sign up as a driver
        </Button>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-gray-400 text-sm border-t">
        <div className="flex items-center justify-center gap-1 mb-2">
          <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
          <span className="font-semibold text-gray-700">Haul</span>
          <span>— Built in Butte, Montana</span>
        </div>
        <p>© {new Date().getFullYear()} Smart Spaces AI LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
