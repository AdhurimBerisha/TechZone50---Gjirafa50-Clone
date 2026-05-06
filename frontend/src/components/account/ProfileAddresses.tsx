import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export const ProfileAddresses = () => {
  const { getToken } = useAuth();

  const { currentUser, fetchAddresses, addAddress, deleteAddress } =
    useAuthStore();

  const addresses = currentUser?.addresses || [];

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false,
  });

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      if (!token) return;

      await fetchAddresses(token);
    };

    load();
  }, [fetchAddresses, getToken]);

  // add address
  const handleAdd = async () => {
    const token = await getToken();
    if (!token) return;

    await addAddress(token, form);

    setForm({
      fullName: "",
      phone: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      isDefault: false,
    });
  };

  // delete address
  const handleDelete = async (id: string) => {
    const token = await getToken();
    if (!token) return;

    await deleteAddress(token, id);
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="font-semibold mb-4">Addresses</h2>

      {/* FORM */}
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Street"
          className="col-span-2"
          value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })}
        />
        <input
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <input
          placeholder="State"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        />
        <input
          placeholder="Zip Code"
          value={form.zipCode}
          onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
        />
        <input
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />
      </div>

      <button
        onClick={handleAdd}
        className="mt-3 bg-primary text-white px-4 py-2 rounded"
      >
        Add Address
      </button>

      {/* LIST */}
      <div className="mt-6 space-y-3">
        {addresses.map((a) => (
          <div key={a.id} className="border p-3 rounded flex justify-between">
            <div>
              <p className="font-medium">{a.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {a.street}, {a.city}, {a.country}
              </p>
            </div>

            <button
              onClick={() => handleDelete(a.id)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
