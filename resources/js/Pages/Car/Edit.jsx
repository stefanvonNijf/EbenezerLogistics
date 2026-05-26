import React, { useRef } from 'react';
import { useForm, Link, Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function CarEdit({ car, photos }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        brand: car.brand ?? '',
        license_plate: car.license_plate ?? '',
        mileage: car.mileage ?? '',
        photos: [],
    });

    const fileInputRef = useRef(null);

    const handlePhotos = (e) => {
        setData('photos', Array.from(e.target.files));
    };

    const removeNewPhoto = (index) => {
        const updated = data.photos.filter((_, i) => i !== index);
        setData('photos', updated);
        if (updated.length === 0 && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const deleteExistingPhoto = (photoId) => {
        router.delete(route('cars.photos.destroy', photoId), { preserveScroll: true });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('cars.update', car.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Car" />

            <div className="lg:max-w-2xl mx-auto px-6 sm:px-6 lg:px-8">
                <h1 className="text-xl font-bold mb-6">Edit Car</h1>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="font-medium">Brand</label>
                        <input
                            type="text"
                            value={data.brand}
                            onChange={(e) => setData('brand', e.target.value)}
                            className="border rounded px-3 py-2 w-full mt-1"
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

                    {/* Existing photos */}
                    {photos.length > 0 && (
                        <div>
                            <label className="font-medium">Current photos</label>
                            <div className="mt-2 flex flex-wrap gap-3">
                                {photos.map((photo) => (
                                    <div key={photo.id} className="relative w-24 h-24">
                                        <img
                                            src={photo.url}
                                            alt="Car photo"
                                            className="w-full h-full object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => deleteExistingPhoto(photo.id)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add new photos */}
                    <div>
                        <label className="font-medium">Add photos</label>
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
                                            onClick={() => removeNewPhoto(i)}
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
                            Save changes
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
