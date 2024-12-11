export default function SlideButton ({ features, currentSlide, setCurrentSlide}: {features: any, currentSlide: number, setCurrentSlide: any}){
    return( 
        <>
            <div className="flex justify-center gap-2 mt-8">
              {features?.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? "bg-white" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
        </>
    )
}