import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { labelEvent, LabelEventRequest, ProgramContentDetails } from "@/services/stream.service";
import brandsData from "./brands.json";
import { Brand } from "./types";

type ProgramFormatType =
  | "Film"
  | "Series"
  | "Structured Studio Programs"
  | "Interactive Programs"
  | "Artistic Performances";
type ProgramContentType =
  | "Popular Drama / Comedy"
  | "Animation Film"
  | "Documentary Film"
  | "Short Film"
  | "Other Film"
  | "General News"
  | "Animation Series / Cartoon"
  | "Documentary Series"
  | "Docusoap / Reality Series"
  | "Other Series"
  | "Science / Geography"
  | "Lifestyle: Showbiz, Stars"
  | "Entertainment: Humor";
type SpotsFormatType = "BB" | "CAPB" | "OOBS";
type AutoPromoContentType =
  | "Foreign"
  | "Other Advertising"
  | "Sports: Football"
  | "Tele-shopping"
  | "Other / Mixed / Unknown";

interface LabelDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedEvents: number[];
  labeledBy: string;
  onLabelSuccess: () => void;
}

export default function LabelDialog({
  isOpen,
  setIsOpen,
  selectedEvents,
  labeledBy,
  onLabelSuccess,
}: LabelDialogProps) {
  const [labeling, setLabeling] = useState(false);
  const [detectionType, setDetectionType] = useState<
    "Program Content" | "Commercial Break" | "Spots outside breaks" | "Auto-promo" | "Song" | "Error"
  >("Program Content");
  const [title, setTitle] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [programFormatType, setProgramFormatType] = useState<ProgramFormatType | "">("");
  const [programContentType, setProgramContentType] = useState<ProgramContentType | "">("");
  const [spotsFormatType, setSpotsFormatType] = useState<SpotsFormatType | "">("");
  const [autoPromoContentType, setAutoPromoContentType] = useState<AutoPromoContentType | "">("");
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [errorType, setErrorType] = useState<"Signal Lost" | "Blank Image" | "">("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [category, setCategory] = useState("");
  const [sector, setSector] = useState("");
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrand, setCustomBrand] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  const typedBrandsData = brandsData as Brand[];

  const filteredBrands = useMemo(() => {
    if (!brandSearch) return typedBrandsData;
    return typedBrandsData.filter((brand) =>
      brand.name.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brandSearch, typedBrandsData]);

  const handleBrandChange = (brandName: string) => {
    if (brandName === "custom") {
      setIsCustomBrand(true);
      setSelectedBrand("");
      setSelectedProduct("");
      setCategory("");
      setSector("");
      setTitle("");
    } else {
      setIsCustomBrand(false);
      setSelectedBrand(brandName);
      setSelectedProduct("");
      setCategory("");
      setSector("");
      setTitle(brandName);
      setCustomBrand("");
    }
  };

  const handleProductChange = (productName: string) => {
    setSelectedProduct(productName);
    const selectedBrandData = typedBrandsData.find((brand) => brand.name === selectedBrand);
    if (selectedBrandData) {
      const product = selectedBrandData.products.find((p: { name: string; }) => p.name === productName);
      if (product) {
        setCategory(product.category);
        setSector(product.sector);
        setTitle(`${selectedBrand} ${productName}`);
      }
    }
  };

  const handleCustomBrandChange = (value: string) => {
    setCustomBrand(value);
    setTitle(value);
    setCategory("");
    setSector("");
  };

  const handleLabelEvent = async () => {
    if (selectedEvents.length === 0) return;

    if (
      detectionType === "Program Content" &&
      (!programDescription || !programFormatType || !programContentType)
    ) {
      return;
    }
    if (detectionType === "Spots outside breaks" && !spotsFormatType) {
      return;
    }
    if (detectionType === "Auto-promo" && !autoPromoContentType) {
      return;
    }
    if (detectionType === "Song" && (!songName || !artistName)) {
      return;
    }
    if (detectionType === "Error" && !errorType) {
      return;
    }
    if (
      ["Commercial Break", "Spots outside breaks", "Auto-promo"].includes(detectionType) &&
      !title
    ) {
      return;
    }

    setLabeling(true);
    try {
      const labelRequest: LabelEventRequest = {
        eventIds: selectedEvents,
        detectionType,
        title: title || undefined,
        labeledBy: labeledBy || undefined,
        ...(detectionType === "Program Content" &&
        programFormatType &&
        programContentType
          ? {
              programContentDetails: {
                description: programDescription,
                formatType: programFormatType as ProgramContentDetails["formatType"],
                contentType: programContentType as ProgramContentDetails["contentType"],
              },
            }
          : {}),
        ...(detectionType === "Commercial Break"
          ? { commercialBreakDetails: { category, sector } }
          : {}),
        ...(detectionType === "Spots outside breaks" && spotsFormatType
          ? {
              spotsOutsideBreaksDetails: {
                formatType: spotsFormatType as SpotsFormatType,
                category,
                sector,
              },
            }
          : {}),
        ...(detectionType === "Auto-promo" && autoPromoContentType
          ? {
              autoPromoDetails: {
                contentType: autoPromoContentType as AutoPromoContentType,
                category,
                sector,
              },
            }
          : {}),
        ...(detectionType === "Song"
          ? {
              songDetails: {
                songName,
                artistName,
              },
            }
          : {}),
        ...(detectionType === "Error" && errorType
          ? { errorDetails: { errorType } }
          : {}),
        repeat: false,
      };

      await labelEvent(labelRequest);
      setIsOpen(false);
      onLabelSuccess();
    } catch (error) {
      console.error("Error labeling events:", error);
    } finally {
      setLabeling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Label Events</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="detectionType">Detection Type</Label>
            <Select
              value={detectionType}
              onValueChange={(value: "Program Content" | "Commercial Break" | "Spots outside breaks" | "Auto-promo" | "Song" | "Error") =>
                setDetectionType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select detection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Program Content">Program Content</SelectItem>
                <SelectItem value="Commercial Break">Commercial Break</SelectItem>
                <SelectItem value="Spots outside breaks">Spots outside breaks</SelectItem>
                <SelectItem value="Auto-promo">Auto-promo</SelectItem>
                <SelectItem value="Song">Song</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {["Commercial Break", "Spots outside breaks", "Auto-promo"].includes(detectionType) ? (
            <>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select value={isCustomBrand ? "custom" : selectedBrand} onValueChange={handleBrandChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Search brands..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    <SelectItem value="custom">Custom Brand</SelectItem>
                    {filteredBrands.map((brand) => (
                      <SelectItem key={brand.name} value={brand.name}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isCustomBrand ? (
                <>
                  <div>
                    <Label htmlFor="customBrand">Custom Brand Name</Label>
                    <Input
                      id="customBrand"
                      placeholder="Enter custom brand name"
                      value={customBrand}
                      onChange={(e) => handleCustomBrandChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="Enter category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      placeholder="Enter sector"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                selectedBrand && (
                  <>
                    <div>
                      <Label htmlFor="product">Product</Label>
                      <Select value={selectedProduct} onValueChange={handleProductChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {typedBrandsData
                            .find((brand) => brand.name === selectedBrand)
                            ?.products.map((product) => (
                              <SelectItem key={product.name} value={product.name}>
                                {product.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" value={category} disabled />
                    </div>
                    <div>
                      <Label htmlFor="sector">Sector</Label>
                      <Input id="sector" value={sector} disabled />
                    </div>
                  </>
                )
              )}
            </>
          ) : (
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          )}
          {detectionType === "Program Content" && (
            <>
              <div>
                <Label htmlFor="programDescription">Description</Label>
                <Input
                  id="programDescription"
                  placeholder="Enter description"
                  value={programDescription}
                  onChange={(e) => setProgramDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="programFormatType">Format Type</Label>
                <Select
                  value={programFormatType}
                  onValueChange={(value) => setProgramFormatType(value as ProgramFormatType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Film">Film</SelectItem>
                    <SelectItem value="Series">Series</SelectItem>
                    <SelectItem value="Structured Studio Programs">Structured Studio Programs</SelectItem>
                    <SelectItem value="Interactive Programs">Interactive Programs</SelectItem>
                    <SelectItem value="Artistic Performances">Artistic Performances</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="programContentType">Content Type</Label>
                <Select
                  value={programContentType}
                  onValueChange={(value) => setProgramContentType(value as ProgramContentType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Popular Drama / Comedy">Popular Drama / Comedy</SelectItem>
                    <SelectItem value="Animation Film">Animation Film</SelectItem>
                    <SelectItem value="Documentary Film">Documentary Film</SelectItem>
                    <SelectItem value="Short Film">Short Film</SelectItem>
                    <SelectItem value="Other Film">Other Film</SelectItem>
                    <SelectItem value="General News">General News</SelectItem>
                    <SelectItem value="Animation Series / Cartoon">Animation Series / Cartoon</SelectItem>
                    <SelectItem value="Documentary Series">Documentary Series</SelectItem>
                    <SelectItem value="Docusoap / Reality Series">Docusoap / Reality Series</SelectItem>
                    <SelectItem value="Other Series">Other Series</SelectItem>
                    <SelectItem value="Science / Geography">Science / Geography</SelectItem>
                    <SelectItem value="Lifestyle: Showbiz, Stars">Lifestyle: Showbiz, Stars</SelectItem>
                    <SelectItem value="Entertainment: Humor">Entertainment: Humor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {detectionType === "Spots outside breaks" && (
            <div>
              <Label htmlFor="spotsFormatType">Format Type</Label>
              <Select
                value={spotsFormatType}
                onValueChange={(value) => setSpotsFormatType(value as SpotsFormatType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BB">BB</SelectItem>
                  <SelectItem value="CAPB">CAPB</SelectItem>
                  <SelectItem value="OOBS">OOBS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {detectionType === "Auto-promo" && (
            <div>
              <Label htmlFor="autoPromoContentType">Content Type</Label>
              <Select
                value={autoPromoContentType}
                onValueChange={(value) => setAutoPromoContentType(value as AutoPromoContentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Foreign">Foreign</SelectItem>
                  <SelectItem value="Other Advertising">Other Advertising</SelectItem>
                  <SelectItem value="Sports: Football">Sports: Football</SelectItem>
                  <SelectItem value="Tele-shopping">Tele-shopping</SelectItem>
                  <SelectItem value="Other / Mixed / Unknown">Other / Mixed / Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {detectionType === "Song" && (
            <>
              <div>
                <Label htmlFor="songName">Song Name</Label>
                <Input
                  id="songName"
                  placeholder="Enter song name"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="artistName">Artist Name</Label>
                <Input
                  id="artistName"
                  placeholder="Enter artist name"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                />
              </div>
            </>
          )}
          {detectionType === "Error" && (
            <div>
              <Label htmlFor="errorType">Error Type</Label>
              <Select
                value={errorType}
                onValueChange={(value) => setErrorType(value as "Signal Lost" | "Blank Image")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select error type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Signal Lost">Signal Lost</SelectItem>
                  <SelectItem value="Blank Image">Blank Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={labeling}>
              Cancel
            </Button>
            <Button onClick={handleLabelEvent} disabled={labeling}>
              {labeling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Labeling...
                </>
              ) : (
                "Label Events"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}