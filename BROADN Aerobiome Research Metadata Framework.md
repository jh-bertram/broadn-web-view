# **Comprehensive Architecture for Experimental Metadata Integration: Supporting the Biology Integration Institute Regional OneHealth Aerobiome Discovery Network (BROADN)**

The study of the aerobiome—the collective of microscopic organisms inhabiting the atmosphere—represents one of the most significant challenges and opportunities in modern environmental science. Headquartered at Colorado State University, the Biology Integration Institute Regional OneHealth Aerobiome Discovery Network (BROADN) is a transdisciplinary initiative funded by the National Science Foundation aimed at uncovering the dynamics of these microbial communities.1 The atmosphere is not merely a passive conduit for microbial dispersal; it is a complex, harsh, and highly variable ecosystem where survival is a feat of biological adaptation.3 To effectively document, display, and analyze the work performed under the BROADN umbrella, a robust web-based framework for experimental metadata is required. This framework must account for the biological, atmospheric, and engineering variables that intersect to define aerobiome research.1

## **Transdisciplinary Mission and Institutional Framework**

The BROADN project is established on the principle that the health of humans, animals, plants, and the environment is inextricably linked—a philosophy known as OneHealth.2 To address the gaps in our understanding of the aerobiome, BROADN assembles expertise across four primary partnering institutions: Colorado State University (CSU) in Fort Collins, CSU Pueblo, Doane University, and the University of Colorado Boulder.2 This diverse research team consists of faculty, staff, and students from five colleges at CSU, encompassing 15 distinct research labs.7  
The research is organized around three intersecting goals that provide the structural foundation for all data collection and metadata categorization:

| Core Research Goal | Objective and Scope |
| :---- | :---- |
| Goal 1: Standardization | Establish rigorous standards for aerobiome sampling and analysis, including the development of new instrumentation and limits of detection.1 |
| Goal 2: Predictive Modeling | Develop models to predict aerobiome composition based on terrestrial microbiomes and environmental drivers.1 |
| Goal 3: Mechanistic Survival | Formulate mechanistic models to understand how microbes sense, respond, and adapt to the extreme stressors of atmospheric transit.1 |

Under the leadership of Principal Investigator Dr. Sue VandeWoude and Aspirational Goal Leaders Mark Hernandez, Pankaj Trivedi, and Brad Borlee, the project integrates these goals to create a comprehensive picture of microbial life in the air.2 This transdisciplinary approach necessitates a metadata framework that can bridge disparate fields, from genomic sequencing to atmospheric physics and aeronautical engineering.1

## **Scientific Context and the Significance of the Aerobiome**

Microorganisms in the air play vital roles in ecological diversity, disease outbreaks, and potentially the Earth's hydrologic cycle.3 While the scientific community has extensively mapped the microbiomes of soil and aquatic systems, the atmospheric microbiome remains a frontier.1 BROADN research has demonstrated that air microbes are as diverse and complex as those found in terrestrial environments, with some taxa forming a "core microbiota" that remains consistent across certain regions.1  
Interactions between the air and other ecosystems are highly specific; for instance, soil bacteria exhibit stronger connections with air microbes, whereas air fungi appear more closely linked to plant-associated communities.1 Understanding these links is essential for predicting how pathogens disperse and how environmental changes might alter the aerobiome’s functional role in health and climate.10 The complexity of these interactions demands that metadata captures the precise "environmental triad" of broad-scale context, local-scale features, and the specific medium surrounding the sample.13

## **Goal 1: Standards for Aerobiome Sampling and Analysis**

A primary obstacle in aerobiology is the lack of standardized collection methods. Bioaerosol samplers vary in their efficiency, flow rates, and their ability to maintain the integrity of delicate biological material, such as viral RNA.1 Goal 1 projects focus on filling these gaps by evaluating sampler performance under various conditions, including controlled laboratory chambers, ground-level field tests, and high-altitude drone flights.1

### **High-Volume Samplers and Viral RNA Integrity**

High-volume samplers like the SASS 3100 are often used to capture the low biomass concentrations found in the air, but the high flow rates can lead to the desiccation or physical degradation of samples.1 BROADN research specifically evaluates the impact of high-flow sampling on enveloped viruses (which have a protective but fragile outer layer) versus tougher non-enveloped viruses.1 Metadata for these experiments must include not only the sampler type but also the specific flow rate, duration of sampling, and the resulting RNA integrity metrics.1

### **Comparisons of Collection Technology**

The project compares dry filter-based samplers with water-based condensation samplers, such as the BioSpot-VIVAS and BioSpot-GEM.1 Water condensation samplers are often more effective at maintaining the viability of sensitive organisms because they avoid the drying effects of filters.1

| Sampler Technology | Mechanism of Action | Experimental Context |
| :---- | :---- | :---- |
| SASS 3100 | High-volume dry air collection using filters. | Performance evaluated for viral RNA and drone-mounted efficiency.1 |
| BioSpot-VIVAS / GEM | Water condensation based collection into liquid medium. | Avoids desiccation; used for maintaining organism viability.1 |
| mini-SASS | Lighter version of the SASS 3100 designed for drones. | Optimized for flight time and high-altitude data collection.1 |
| HICCUP | High-flow-rate improved condensation collection. | Pre-concentration and condensation used to optimize bioaerosol capture.1 |

### **Instrumentation Research and the Virtual Impactor**

At the Laboratory of Air Quality Research (LAQR), researchers led by Shantanu Jathar and Marina Nieto-Caballero are developing an innovative virtual impactor designed to capture bioaerosols efficiently into a liquid medium.4 This technology is critical for environmental monitoring, biodefense, and public health applications.4  
A virtual impactor separates an inlet flow (![][image1]) into a coarse particle flow (![][image2]) and a fine particle flow (![][image3]) based on the inertia of the particles.15 This is achieved by aligning an acceleration nozzle and a collection probe along a single axis with a small separation region.15 The "cutpoint size" is the particle diameter where 50% of the particles are separated.15 Advanced virtual impactors aim for particle losses of less than 1% for particles in the ![][image4] to ![][image5] ![][image6] range.15 Metadata regarding these instruments must capture the dimensional relationships of components, flow rates, and the experimental aerosol models used for characterization.4

## **Goal 2: Predictive Models of Aerobiome Composition**

Predictive modeling aims to determine which microbes are in the air at any given time based on meteorological and land-use data.1 This work involves identifying the "indicators" of aerobiome composition and understanding how local ecosystem characteristics influence regional atmospheric transport.10

### **The Grassland and CEPR Campaigns**

A major focus of Goal 2 is the Colorado Eastern Plains Research (CEPR) campaign, specifically the work done in Fall 2022 and Spring 2023 in the central grasslands.1 Researchers analyzed between 36 and 40 samples from these campaigns to understand how habitats influence airborne communities.1 The project uses sampling towers to measure changes in the aerobiome across different heights and times of day, providing a vertical profile of microbial diversity.1  
Metadata for the CEPR campaign includes:

* **Vegetation Proportion:** Average cover within 50m and 800m buffers (e.g., 0.11 for paved, 0.90 for grass, 0.97 for forest).19  
* **Structural Diversity:** Shannon-Wiener index values for vegetation diversity (ranging from 0.22 to 3.35 depending on site type).19  
* **Meteorological Conditions:** Daily average temperatures (13.1 to 23.7$^{\\circ}$C), wind speeds (2.1 to 5.0 m/s), and barometric pressure.10  
* **Taxonomic Groupings:** Dominant prokaryotic and eukaryotic orders, as well as plant families detected through multi-marker sequencing.10

### **Surface-Atmosphere Flux and Lofting Dynamics**

To understand whether microbes are local or long-range, BROADN uses the "flux gradient approach".1 This involves taking DNA samples from different heights on towers while simultaneously measuring heat flow.1 These measurements allow for the calculation of source strength and the movement of bioaerosols over several days and seasons.1 This research provides a crucial link between the terrestrial microbiome and the atmospheric one, requiring metadata that synchronized biological sampling with micrometeorological data.1

## **Goal 3: Mechanistic Models for Microbe Survival**

The aerobiome is an extreme environment characterized by high UV radiation, fluctuating temperatures, and severe desiccation.4 Goal 3 seeks to identify the specific genetic traits and physiological responses that allow certain microbes to survive these stressors.4

### **Genetic Dissection of Survival Traits**

Research in the Borlee and Leach labs focuses on *Bacillus* species, which are frequently isolated from air samples.4 Summer Undergraduate Research Fellows (SURF) screen variant libraries of *Bacillus* to identify genes associated with "superpowers" such as:

* **Desiccation Tolerance:** The ability to remain viable after extreme drying.4  
* **UV Resistance:** Protection against DNA damage from solar radiation.4  
* **Pigment Production:** Natural sunscreens that aid in atmospheric survival.4  
* **Biofilm and Surfactant Production:** Traits that influence attachment and lofting.4

Laboratory metadata for these studies must detail the media preparation, bacterial culture manipulation, library screening protocols, and the specific stressors applied during survival assays.4 If variant strains are identified, metadata also includes results from genome-wide association analysis (GWAS) to pinpoint the genes responsible for the trait variation.4

## **High-Altitude Sampling and Drone Integration**

Drones allow BROADN to access airspace that is otherwise difficult to sample, particularly the planetary boundary layer where lofting occurs.14 Graduate students like Ashley Miller and Peter Kessinger have demonstrated how drone technology can fly air samplers above various locations to collect high-altitude data.14  
The integration of drones introduces a unique set of metadata requirements:

* **Drone Platform:** e.g., the M600 drone used in the 2023 CSU Drone Airshow.14  
* **Altitude and GPS:** Precise vertical distance (e.g., 12 meters in comparative tests) and spatial coordinates.1  
* **Payload Specs:** Weight and power consumption of samplers like the mini-SASS, which impacts total flight time.1  
* **Sampling Environment:** Measurements of atmospheric temperature and wind patterns at the point of collection.1

These high-altitude samples are compared to ground-level data to determine how altitude affects the integrity and composition of microbial communities, providing a 3D perspective of the aerobiome.1

## **Metadata Standards and Data Integration Architecture**

For a web framework to be effective, it must adhere to established community standards that ensure data is Findable, Accessible, Interoperable, and Reusable (FAIR).5 BROADN leverages several national and international standards for this purpose.5

### **The MIxS Standard and Environmental Extensions**

The Genomics Standards Consortium (GSC) developed the Minimum Information about any (x) Sequence (MIxS) standard to describe the contextual information of sampling and sequencing.5 MIxS is modular, consisting of checklists (like MIMS for metagenomes) and environmental extensions.22

#### **MIxS-Air Extension**

The MIxS-Air package is specifically tailored for atmospheric samples.23 It includes mandatory and optional terms for capturing the gaseous environment:

| MIxS-Air Term | Cardinality | Description |
| :---- | :---- | :---- |
| samp\_name | Mandatory (1) | Local identifier for the material sample.24 |
| project\_name | Mandatory (1) | Name of the sequencing project.24 |
| alt | Mandatory (1) | Altitude of the sample position above the earth's surface.24 |
| elev | Recommended | Height above mean sea level of the sampling site.24 |
| barometric\_press | Optional | Force per unit area exerted by the air above the surface.24 |
| humidity | Optional | Amount of water vapor in the air.24 |
| temp | Optional | Temperature of the sample at the time of sampling.24 |
| wind\_direction | Optional | Direction from which the wind originates.24 |
| wind\_speed | Optional | Speed of the wind during collection.24 |
| air\_PM\_concen | Optional | Concentration of particulate matter (PM10/PM2.5).24 |
| carb\_dioxide | Optional | Carbon dioxide gas amount or concentration.24 |

#### **MIxS-BE (Built Environment) Extension**

Studies of the "built environment" are a key component of the OneHealth approach, as indoor air quality significantly impacts human health.25 MIxS-BE provides a checklist for indoor spaces, including building and room descriptors.25 Terms include ventilation type, occupancy at sampling, carbon dioxide levels, and surface materials.25

### **Ontological Mapping and the EnvO Triad**

To ensure interoperability, BROADN utilizes the Environmental Ontology (EnvO) and the Genomes Online Database (GOLD) ecosystem classification.13 The "EnvO triad" provides a standardized way to describe environmental context 13:

1. **env\_broad\_scale (Biome):** The major environmental system (e.g., grassland biome \[ENVO:01000177\]).13  
2. **env\_local\_scale (Feature):** The direct expression of the local vicinity (e.g., mountain, agricultural field).13  
3. **env\_medium (Material):** The material immediately surrounding the sample (e.g., air \[ENVO:00002005\]).13

By mapping project metadata to these ontologies, the BROADN framework can integrate with national repositories like the National Microbiome Data Collaborative (NMDC).13

## **Data Provenance and Workflow Management**

Provenance—the record of the origin and history of data—is essential for scientific integrity and reproducibility.28 In a project as complex as BROADN, data flows from the field to the lab, through sequencing, and into bioinformatics pipelines.30

### **Laboratory and Sequence Metadata**

Beyond environmental context, metadata must capture "preparation metadata" (how samples were extracted and sequenced) and "data processing/analysis metadata" (software versions, parameters, and algorithms used).5 LIMS (Laboratory Information Management Systems) and ELNs (Electronic Lab Notebooks) play a vital role in maintaining this traceability.30

### **Bioinformatics Workflow Standards**

BROADN uses standardized bioinformatics workflows to process raw multi-omics data into interpretable results.32 These workflows are often managed using systems like WDL (Workflow Description Language), Nextflow, or CWL (Common Workflow Language).33

| Workflow Management Aspect | Importance for Aerobiome Data |
| :---- | :---- |
| Modularity | Enables checkpointing and reuse of tasks without refactoring entire pipelines.33 |
| Retrospective Provenance | Captures the exact runtime environment, software versions, and parameters used in a specific execution.31 |
| Scalability | Handles the intense amount of data produced by modern sequencing technologies.30 |
| Traceability | Maintains audit trails and electronic signatures to log data access and modifications.30 |

The PROV-DM model is a common framework for managing these details, allowing researchers to compare results from different executions and plan new experiments efficiently.28

## **Recommendations for the Web Page Framework**

The proposed framework for displaying BROADN experimental metadata should serve both the research team and the broader scientific community. Following the best practices of portals like the NMDC and NEON, the framework should incorporate several key features.20

### **Faceted Search and Navigation**

A "faceted search" allows users to narrow down selections based on overlapping criteria.32

| Search Facet | Data Variable | Metadata Source |
| :---- | :---- | :---- |
| Ecosystem | Grassland, Forest, Built Environment | EnvO Biome.13 |
| Geography | Latitude, Longitude, Altitude | Sample Metadata.32 |
| Methodology | SASS 3100, mini-SASS, BioSpot | Instrument Specs.1 |
| Taxonomy | Prokaryota, Eukaryota, Fungi | Marker Gene Data.10 |
| Time | Year, Month, Day, Time of Day | ISO 8601 Stamp.32 |

### **Interactive Visualizations**

The portal should include interactive components to help visualize the data in context 32:

* **Geographic Maps:** Plot sampling locations with click-and-drag panning and zoom controls.32  
* **Temporal Sliders:** Filter data by specific date ranges or view time-series graphs for meteorological conditions.32  
* **Taxonomic Plots:** Use bar plots or "Sankey diagrams" to show community composition by ecosystem or habitat type.32  
* **Workflow Diagrams:** Display the provenance of specific data files, showing the processing steps from raw reads to annotated outputs.28

### **Data Access and Interoperability**

Data should be downloadable in multiple formats (CSV, JSON, HTML, WaterML2.0).34 Each data package should contain a README file and machine-readable metadata in formats like EML (Ecological Metadata Language).36 Adopting the Atmospheric Composition Variable Standard Names (ACVSNC) will further improve machine-readability and interoperability for atmospheric scientists.9

## **Broader Socio-Economic and Regional Impacts**

The BROADN project is situated within a region experiencing significant environmental and economic shifts. The Colorado Eastern Plains are currently being studied for the impact of renewable energy developments, including solar, wind, and hydrogen projects.37 While these are primarily energy studies, they provide valuable contextual metadata for aerobiome research. For instance, the "boom-and-bust" economic cycles, land-use changes for solar farms, and the capital investments in the region all influence the "human-managed" landscapes that serve as sources for the aerobiome.37  
Furthermore, BROADN’s community outreach—such as the "Explore the Air Around You" check-out kits at libraries and workshops for middle school students—generates qualitative metadata regarding public understanding and scientific engagement.6 This outreach is a core part of the mission to train and inspire the next generation of biological scientists.1

## **Conclusion**

Developing a comprehensive metadata framework for the BROADN project is an exercise in integrating the complex variables of a OneHealth ecosystem. By bridging the gap between molecular biology, engineering, and atmospheric science through standardized metadata like MIxS-Air and MIxS-BE, the project ensures that its findings are not just isolated data points but pieces of a larger, coherent picture. The proposed web framework will serve as the portal to this hidden world, allowing researchers to explore the dynamics of microbial survival and dispersal in the Rocky Mountain region and beyond. As sequencing and sensor technologies continue to evolve, the adherence to these metadata standards will remain the bedrock of reproducible and impactful aerobiome science.

#### **Works cited**

1. Projects \- BROADN, accessed March 17, 2026, [https://broadn.colostate.edu/projects/](https://broadn.colostate.edu/projects/)  
2. About \- BROADN Aerobiome Research \- Colorado State University, accessed March 17, 2026, [https://broadn.colostate.edu/about/](https://broadn.colostate.edu/about/)  
3. Aerobiome Foundations \- BROADN, accessed March 17, 2026, [https://broadn.colostate.edu/aerobiome-foundations/](https://broadn.colostate.edu/aerobiome-foundations/)  
4. Undergraduate research \- BROADN, accessed March 17, 2026, [https://broadn.colostate.edu/undergraduate-research/](https://broadn.colostate.edu/undergraduate-research/)  
5. Metadata Guidelines \- NOAA Omics Data Management Guide, accessed March 17, 2026, [https://noaa-omics-dmg.readthedocs.io/en/latest/metadata-guidelines.html](https://noaa-omics-dmg.readthedocs.io/en/latest/metadata-guidelines.html)  
6. BROADN Aerobiome Research \- Colorado State University, accessed March 17, 2026, [https://broadn.colostate.edu/](https://broadn.colostate.edu/)  
7. BROADN project welcomes 2025 Summer Undergraduate Research Fellows, accessed March 17, 2026, [https://source.colostate.edu/broadn-project-welcomes-2025-summer-undergraduate-research-fellows/](https://source.colostate.edu/broadn-project-welcomes-2025-summer-undergraduate-research-fellows/)  
8. Microbiome Metadata Management \- Pacific Northwest National Laboratory, accessed March 17, 2026, [https://www.pnnl.gov/main/publications/external/technical\_reports/PNNL-34342.pdf](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-34342.pdf)  
9. Practical Guide for the NASA ESDS Atmospheric Composition Variable Standard Names Convention Controlled Vocabulary, accessed March 17, 2026, [https://www-air.larc.nasa.gov/missions/etc/AtmosphericCompositionVariableStandardNames.pdf](https://www-air.larc.nasa.gov/missions/etc/AtmosphericCompositionVariableStandardNames.pdf)  
10. The aerobiome uncovered: Multi-marker metabarcoding reveals potential drivers of turn-over in the full microbial community in the air \- ResearchGate, accessed March 17, 2026, [https://www.researchgate.net/publication/350870370\_The\_aerobiome\_uncovered\_Multi-marker\_metabarcoding\_reveals\_potential\_drivers\_of\_turn-over\_in\_the\_full\_microbial\_community\_in\_the\_air](https://www.researchgate.net/publication/350870370_The_aerobiome_uncovered_Multi-marker_metabarcoding_reveals_potential_drivers_of_turn-over_in_the_full_microbial_community_in_the_air)  
11. Spatiotemporal patterns of airborne microbial communities in forest and grassland ecosystems \- PMC, accessed March 17, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC12892990/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12892990/)  
12. Enhancing Domain Relevant Metadata Standards for Atmospheric Composition Measurements Through FAIR Principles, accessed March 17, 2026, [https://ntrs.nasa.gov/api/citations/20240014876/downloads/FallAGU2024\_Metadata1202.pdf?attachment=true](https://ntrs.nasa.gov/api/citations/20240014876/downloads/FallAGU2024_Metadata1202.pdf?attachment=true)  
13. Metadata Standards Documentation \- NMDC Schema Documentation \- GitHub Pages, accessed March 17, 2026, [https://microbiomedata.github.io/nmdc-schema/Metadata\_Documentation\_Overview/](https://microbiomedata.github.io/nmdc-schema/Metadata_Documentation_Overview/)  
14. Colorado Drone Airshow 2023 \- BROADN, accessed March 17, 2026, [https://broadn.colostate.edu/colorado-drone-airshow-2023/](https://broadn.colostate.edu/colorado-drone-airshow-2023/)  
15. High efficiency virtual impactor (Patent) | OSTI.GOV, accessed March 17, 2026, [https://www.osti.gov/biblio/6692950](https://www.osti.gov/biblio/6692950)  
16. High efficiency virtual impactor (Patent) | OSTI.GOV, accessed March 17, 2026, [https://www.osti.gov/biblio/5684836](https://www.osti.gov/biblio/5684836)  
17. High efficiency virtual impactor (Patent) | OSTI.GOV, accessed March 17, 2026, [https://www.osti.gov/biblio/864046](https://www.osti.gov/biblio/864046)  
18. Virtual impactor (Patent) | OSTI.GOV, accessed March 17, 2026, [https://www.osti.gov/biblio/866699](https://www.osti.gov/biblio/866699)  
19. Spatiotemporal Controls on the Urban Aerobiome \- Frontiers, accessed March 17, 2026, [https://www.frontiersin.org/journals/ecology-and-evolution/articles/10.3389/fevo.2019.00043/full](https://www.frontiersin.org/journals/ecology-and-evolution/articles/10.3389/fevo.2019.00043/full)  
20. Using Data | NSF NEON | Open Data to Understand our Ecosystems, accessed March 17, 2026, [https://www.neonscience.org/data-samples/guidelines-policies](https://www.neonscience.org/data-samples/guidelines-policies)  
21. Overview of the NMDC Metadata Standards \- National Microbiome Data Collaborative, accessed March 17, 2026, [https://microbiomedata.org/overview/](https://microbiomedata.org/overview/)  
22. GenomicsStandardsConsortium/mixs: Minimum Information about any (X) Sequence” (MIxS) specification \- GitHub, accessed March 17, 2026, [https://github.com/GenomicsStandardsConsortium/mixs](https://github.com/GenomicsStandardsConsortium/mixs)  
23. mixs, accessed March 17, 2026, [https://genomicsstandardsconsortium.github.io/mixs/](https://genomicsstandardsconsortium.github.io/mixs/)  
24. Extension: air (Air) \- mixs, accessed March 17, 2026, [https://genomicsstandardsconsortium.github.io/mixs/0016000/](https://genomicsstandardsconsortium.github.io/mixs/0016000/)  
25. a MIxS extension defining a minimum information standard for sequence data from the built environment \- PMC, accessed March 17, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC3869023/](https://pmc.ncbi.nlm.nih.gov/articles/PMC3869023/)  
26. MoBE\_Metadata\_Standard\_Guid, accessed March 17, 2026, [http://microbe.net/wp-content/uploads/2014/05/MoBE\_Metadata\_Standard\_Guide\_2014.docx](http://microbe.net/wp-content/uploads/2014/05/MoBE_Metadata_Standard_Guide_2014.docx)  
27. Guest Post: Metadata for the Built Environment – MIxS-BE package \- microBEnet, accessed March 17, 2026, [https://microbe.net/2012/05/03/metadata-for-the-built-environment-mixs-be-package/](https://microbe.net/2012/05/03/metadata-for-the-built-environment-mixs-be-package/)  
28. Provenance in bioinformatics workflows \- PMC \- NIH, accessed March 17, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC3816297/](https://pmc.ncbi.nlm.nih.gov/articles/PMC3816297/)  
29. Provenance Information for Biomedical Data and Workflows: Scoping Review, accessed March 17, 2026, [https://www.jmir.org/2024/1/e51297/](https://www.jmir.org/2024/1/e51297/)  
30. From Data to Discovery: Crafting Sequencing Bioinformatics Workflows | Lab Manager, accessed March 17, 2026, [https://www.labmanager.com/from-data-to-discovery-crafting-sequencing-bioinformatics-workflows-33586](https://www.labmanager.com/from-data-to-discovery-crafting-sequencing-bioinformatics-workflows-33586)  
31. Investigating reproducibility and tracking provenance – A genomic workflow case study, accessed March 17, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC5508699/](https://pmc.ncbi.nlm.nih.gov/articles/PMC5508699/)  
32. Navigating the Data Portal \- NMDC Documentation, accessed March 17, 2026, [https://docs.microbiomedata.org/howto\_guides/portal\_guide/](https://docs.microbiomedata.org/howto_guides/portal_guide/)  
33. Design considerations for workflow management systems use in production genomics research and the clinic | bioRxiv, accessed March 17, 2026, [https://www.biorxiv.org/content/10.1101/2021.04.03.437906v1.full](https://www.biorxiv.org/content/10.1101/2021.04.03.437906v1.full)  
34. USER GUIDE ENVIRONMENTAL DATA PORTAL (EDP) \- Southwest Florida Water Management District, accessed March 17, 2026, [https://www.swfwmd.state.fl.us/sites/default/files/medias/documents/EDP\_User\_Guide.pdf](https://www.swfwmd.state.fl.us/sites/default/files/medias/documents/EDP_User_Guide.pdf)  
35. NMDC Data Portal, accessed March 17, 2026, [https://data.microbiomedata.org/](https://data.microbiomedata.org/)  
36. Data Formats and Conventions | NSF NEON | Open Data to Understand our Ecosystems, accessed March 17, 2026, [https://www.neonscience.org/data-samples/data-management/data-formats-conventions](https://www.neonscience.org/data-samples/data-management/data-formats-conventions)  
37. Pluses and minuses for Colorado's eastern plains \- Big Pivots, accessed March 17, 2026, [https://bigpivots.com/pluses-and-minuses-for-colorados-eastern-plains/](https://bigpivots.com/pluses-and-minuses-for-colorados-eastern-plains/)  
38. Eastern Plains Renewable Energy Impact Study \- Southeast Council of Governments \- Colorado.gov, accessed March 17, 2026, [https://secog.colorado.gov/sites/secog/files/2025-26\_Eastern\_Plains\_Study%20BidNet%20Posting.pdf](https://secog.colorado.gov/sites/secog/files/2025-26_Eastern_Plains_Study%20BidNet%20Posting.pdf)  
39. Eastern Plains Renewable Energy Impact Study \- Southeast Council of Governments \- Colorado, accessed March 17, 2026, [https://secog.colorado.gov/sites/secog/files/RFP%20-%20Eastern%20Plains%20Renewable%20Energy%20Impact%20Study.pdf](https://secog.colorado.gov/sites/secog/files/RFP%20-%20Eastern%20Plains%20Renewable%20Energy%20Impact%20Study.pdf)  
40. Outreach \- BROADN Aerobiome Research \- Colorado State University, accessed March 17, 2026, [https://broadn.colostate.edu/outreach/](https://broadn.colostate.edu/outreach/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAZCAYAAADaILXQAAABr0lEQVR4Xu2USyhEYRTHD3kkrx1ZsFCyIoXsvDYWNpY2irKx8Ex5lEcWIhmSUpayEsmrKDsislBih5XHQrGRyOt/5tyrc0/NNWZhNb/6Lc73/+7Mme87d4iiREAiLIe1MMtkEZMP1+ERnIZz8A7uwEy178/0wQfYZNaT4QW8hikmC4sp+A6rbOBQA7/gkA1+o47kwWGzruEj4T0nNvAjHd7AR5Kf78cHyb6w6SLpaMIGBr5o3ndlAz92SR6qtoHBbWLLBqGIh68kPzfNZBa3iU61lkcyYfUk74UHXvgkmWM/UuEbvIVJzlo23IcZsAgekDTr4RK+wFgbKPhF4q4b1doIHFP1HixTdZAFkgf5wpgeuAbbnbrDyUed2mUbdqt6lbxfHoT/N3i8VmAlbHPWuSt+U/lO7AczPO9uA8wSHFf1D6XwDD7BDdgLj+EpLHH28LG5580ckkyQyzKcVLWHOFgMG0jeWO5iVuWDMEfVfAz9quYR1cfkSyt8hgG4CRe9MbXAeVWfw0JV+1JBcpHsPclMaxJIjpDvhSdnwBv7w8fUDGdgrslcYmABhc6j/CPfYQxUE1KdCEMAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAZCAYAAADaILXQAAABg0lEQVR4Xu2UOS9EURiGvwgRsZVCoZCIVoLW1igo/AEJidbaoEElRGKLpRetYiyFxB8gColQSFBZCgmNCLG973znyrlfZu4dUynmSZ7ifu85Z846IjmyoBA2w05YabKsqYM78AguwQ14Dw9ghdfuz0zAR9hn6sXwAt7AEpNlxCL8gG02cHTAbzhlgzi6RTtOm7oPt4RtTmwQRTm8hU+iy4/iU7RdxoyKzmjeBgYeNNtd2yCKQ9FO7TYwBJPYt0E6CuCb6HLLTGYJJjFi6vWwy9SS8KF8id7jKErhO7yDRa7GbdqE56LvISVX8BXm2cCDD4mz7jV1siZ6jVPCX2dHzoSMwQQcct/DLp9x35bIwfm/weu1DVvhoKvPir5Unkm6gQkHT7stpAmewWe4C8fhMTyFja4Nty3Yb5/YwUk+bIA9oi92Dq56+SSs9r4DOPiyLcYxAF/gAtyDW+H4Fw6+YotxtIgeJH2AteE4uYp10at4KXqjqkItIuA29YvOqsZkOf4hP4xkTeHCLGBUAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAZCAYAAADaILXQAAABqklEQVR4Xu2UOyiGURjHn0TuDEgWSWSQksvqthgYJGVSxGBxXVwGTCLllrKYJFkMboPYTCQpsmFyGRSLRG7/53vO6zvvw/d+n28y+NWvvvf5n/frnOec8xL9EwbRsAzWwAyVhU0eXIf7cBrOwxu4DdOtcb9mAN7BFlWPh2fwEiaoLCSm4Cus1IGhGn7AYR0Eo47kxRFVt+GW8JhDHXiRDK/gPcnyvXgjGRcyvSQzmtCBgjeax13owItdkpeqdKBwJrGlg0BEwWeS5SapTONMoseqZcFB2ADjrLoPvijvJOfYi0T4Aq9hrKkVkLQyBy7AIxhhsi/O4dNPgQVfJJ51s1WbgTvmdyrJMW70x8IiyYu8YUwfXINd5rnb5KPm2SEflpvfMSQrq/XHAn83+HitwgrYaepjJDeV90T/saYVnpK0+Rul8AQ+wA3YDw/gMSwxY7htTr9tsuEeBfnuRMJi2ERyY8fhnJUPwUzrmUmByzCN5LQUuuPAdMBHOAk34ZI79q1iheSzXATbYb1rhAe8WbyR7C3Mdce+VTm5I29ySHCb2uAsSV//+eN8Av++UsdqIu1iAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAWCAYAAAD5Jg1dAAAAx0lEQVR4Xt3QMctBYRiH8TthkGTEzCAy2Egmq9XrI9hkYTLJF7BIJrIok7Kb2KwGs+H9AO/2FtfpuZ+6D5+Af/2W63nO6XREPmsRtDHFANnwsVscOxzQxBB31OylYD38ImFa8OYboqbJBXsbWAsPNHxIa1j5oKtqH/tQ0LDwQVfSPvch+OBQ0BW1b33Ia1j6oCtrn/mQxL+YJ3V1cRdHNh5xtoF1xV2s2PiDP+RMW4t7wdsmuKKPDU5IhW6YZdAR9ydiL2ffsyeA0yVvb/qBbwAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAXCAYAAADpwXTaAAABcElEQVR4Xu2SOyhHYRjGn9xCbovCjJLLYEJSilEZhE1JYkAWShkkg2wGlzCQlJJBycaZKMqkKLPBKCxye97v/c453/n8Fxks/6d+db7nfb7reYG0/qJiMkqWyDgpT5aNMkgXWSCTSJ1BNbkkY2SY3JAX0u1kcsgBOSZtZIo8kGYnYxSQAWdcSt7Jq/0WjZBHkh+GoCe8J1mhIUd/I5+kIjSpU/JFhuz4mhzFZaMOaKbVNVegx492sJ4EB0mJ/d526qJG6896/g9dQa8q16yCTlpPJIBa6696fkKd0NCmHcsjp5pUY/19z49USO7IIfQPipqgk9bCkFW42J7nG8mbnZAtkun4ldBJG44nqrP+sucbySKLzrietJMC6Pv512mBLjbt+ZhLYc6QHvsdkIu4ZNQPXazBNaXrn8kZtL8Cck6eoKcT9UGb2O3FHWg2Uh70CrKDzwfJjaOYJ7dkguxCNyxy6r9WGemFtku2V0vrP/UNNQFPr855hL4AAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAZCAYAAADNAiUZAAABr0lEQVR4Xu2UyytFURSHl8dIHpHknaIkRUoyY8JAmSrFgMxkQh5hRCETBgpFkpIYIEL+BmXoEZERA49IKQN+66613XV2pndA56uve/dvr73POXuffYhCQkL+Gmmw3A9BivmfCBtgnrYTYBVshMmuiGSeJphqsl85gVteNgrPTHsDLsIXkovvwGG4AJ9gIZyGs3AQvsN6HvgbWfAL9nv5OcmFmDo4BktJam9gpvbxU3L2CGs1Y07humkHaCEZVGOyXM26td0Fy2C75nwTjmLNRkzG3MM1L/thHr6S7JmjjWSiCpMxSyTLG2+yDpLaSpPxOM46TRaAl/HIy3jyZwpOzlzBfS9bJdlTWzsOPym6BQFySO5oysuvKTr5iv7yW8u1fdp23MJtL7uk6IPMwQzTR60kE7m1j4Mzmk2QLBMPYlwtHxNHkWY9JuMLcNZLst+bpi8CH4EPeAeX4R7JW8zH4AHuwnytnSTZCr4xRzN8I5nccgAP4THJSxnggqSAJyqBSaaPi+3LxR8K2+9I9wOlgILjI2STLMOA3xFL3Pms9jtiyRDJ8vrHIubwRzvkf/AN+F5TeV37aaIAAAAASUVORK5CYII=>