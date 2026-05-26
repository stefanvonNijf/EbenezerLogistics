import React, { useRef } from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function CarCreate() {
    const { data, setData, post, processing, errors } = useForm({
        brand: '',
        license_plate: '',
        mileage: '',
        photos: [],
    });

    const fileInputRef = useRef(null);

    const handlePhotos = (e) => {
        setData('photos', Array.from(e.target.files));
    };

    const removePhoto = (index) => {
        const updated = data.photos.filter((_, i) => i !== index);
        setData('photos', updated);

        // Reset the file input so the same file can be re-added if needed
        if (updated.length === 0 && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('cars.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Add Car" />

            <div className="lg:max-w-2xl mx-auto px-6 sm:px-6 lg:px-8">
                <h1 className="text-xl font-bold mb-6">Add Car</h1>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="font-medium">Brand</label>
                        <input
                            type="text"
                            value={data.brand}
                            onChange={(e) => setData('brand', e.target.value)}
                            className="border rounded px-3 py-2 w-full mt-1"
                            placeholder="e.g. Toyota"
                        />
                        {errors.brand && <p className="text-red-600 text-sm mt-1">{errors.brand}</p>}
                    </div>

                    <div>
                        <label className="font-medium">License plate</label>
                        <input
                            type="text"
                            value={data.license_plate}
                            onChange={(e) => setData('license_plate', e.target.value)}
                            className="border rounded px-3 py-2 w-full mt-1"
                            placeholder="e.g. AB-123-C"
                        />
                        {errors.license_plate && <p className="text-red-600 text-sm mt-1">{errors.license_plate}</p>}
                    </div>

                    <div>
                        <label className="font-medium">Mileage (optional)</label>
                        <input
                            type="number"
                            min="0"
                            value={data.mileage}
                            onChange={(e) => setData('mileage', e.target.value)}
                            className="border rounded px-3 py-2 w-full mt-1"
                            placeholder="e.g. 45000"
                        />
                        {errors.mileage && <p className="text-red-600 text-sm mt-1">{errors.mileage}</p>}
                    </div>

                    <div>
                        <label className="font-medium">Photos (optional)</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotos}
                            className="block w-full mt-1 text-sm text-gray-600
                                file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
                                file:text-sm file:bg-gray-100 file:text-gray-700
                                hover:file:bg-gray-200"
                        />
                        {errors['photos.0'] && <p className="text-red-600 text-sm mt-1">{errors['photos.0']}</p>}

                        {data.photos.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-3">
                                {data.photos.map((file, i) => (
                                    <div key={i} className="relative w-24 h-24">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(i)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
                        >
                            Add car
                        </button>
                        <Link
                            href={route('cars.index')}
                            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
